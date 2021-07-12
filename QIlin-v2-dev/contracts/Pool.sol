pragma solidity 0.7.6;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

import "./libraries/StrConcat.sol";
import "./libraries/Price.sol";
import "./libraries/BasicMaths.sol";
import "./interfaces/IPoolFactory.sol";
import "./interfaces/IPool.sol";
import "./interfaces/ISystemSettings.sol";
import "./Rates.sol";

contract Pool is ERC20, Rates, IPool {
    using SafeMath for uint256;
    using BasicMaths for uint256;
    using BasicMaths for bool;
    using SafeERC20 for IERC20;

    address public _poolToken;
    address public _settings;

    uint256 public _lastRebaseBlock = 0;
    uint32 public _positionIndex = 0;
    mapping(uint32 => Position) public _positions;

    uint256 public _liquidityPool = 0;
    uint256 public _totalSizeLong = 0;
    uint256 public _totalSizeShort = 0;
    uint256 public _rebaseAccumulatedLong = 0;
    uint256 public _rebaseAccumulatedShort = 0;

    constructor(
        address poolToken,
        address uniPool,
        string memory symbol
    ) ERC20(symbol, symbol) Rates(uniPool) {
        uint8 decimals = ERC20(poolToken).decimals();

        _setupDecimals(decimals);
        _poolToken = poolToken;
        _settings = msg.sender;
    }

    function lsTokenPrice() external view override returns (uint256) {
        return
            Price.lsTokenPrice(
                IERC20(address(this)).totalSupply(),
                _liquidityPool
            );
    }

    function addLiquidity(uint256 amount) external override {
        ISystemSettings(_settings).requireSystemActive();
        address msgSender = msg.sender;
        require(
            IERC20(_poolToken).allowance(msgSender, address(this)) >= amount,
            "Pool Token Approved To Pool Is Not Enough"
        );
        uint256 lsTokenAmount = Price.lsTokenByPoolToken(
            IERC20(address(this)).totalSupply(),
            _liquidityPool,
            amount
        );
        _mint(msgSender, lsTokenAmount);
        _liquidityPool = _liquidityPool.add(amount);
        IERC20(_poolToken).safeTransferFrom(msgSender, address(this), amount);

        emit AddLiquidity(msgSender, amount, lsTokenAmount);
    }

    function removeLiquidity(uint256 amount) external override {
        ISystemSettings(_settings).requireSystemActive();
        address msgSender = msg.sender;
        uint256 lsTokenAmount = Price.lsTokenByPoolToken(
            IERC20(address(this)).totalSupply(),
            _liquidityPool,
            amount
        );
        require(
            IERC20(address(this)).balanceOf(msgSender) >= lsTokenAmount,
            "Ls Token Is Not Enough"
        );

        _burn(msgSender, lsTokenAmount);
        _liquidityPool = _liquidityPool.sub(amount);
        IERC20(_poolToken).safeTransfer(msgSender, amount);

        emit RemoveLiquidity(msgSender, amount, lsTokenAmount);
    }

    function openPosition(
        uint8 direction,
        uint16 leverage,
        uint256 position
    ) external override {
        ISystemSettings setting = ISystemSettings(_settings);
        setting.checkOpenPosition(leverage);
        require(
            direction == 1 || direction == 2,
            "Direction Only Can Be 1 Or 2"
        );
        rebase();

        address msgSender = msg.sender;
        uint256 price = _getPrice();
        uint256 value = position.mul(leverage);
        uint256 actualOpenPrice;
        uint256 nakedPosition;

        if (direction == 1) {
            nakedPosition = Price
            .mulPrice(_totalSizeLong, price)
            .add(value)
            .diff(Price.mulPrice(_totalSizeShort, price));
        } else {
            nakedPosition = Price.mulPrice(_totalSizeLong, price).diff(
                Price.mulPrice(_totalSizeShort, price).add(value)
            );
        }

        if (!setting.meetImbalanceThreshold(nakedPosition, _liquidityPool)) {
            actualOpenPrice = price;
        } else {
            uint256 lsAmplificationX18 = setting.calLsAmplificationX18(
                nakedPosition,
                _liquidityPool
            );
            actualOpenPrice = _calActualOpenPrice(
                lsAmplificationX18,
                value,
                direction
            );
        }

        require(
            IERC20(_poolToken).allowance(msgSender, address(this)) >= position,
            "Pool Token Approved To Pool Is Not Enough"
        );
        IERC20(_poolToken).safeTransferFrom(msgSender, address(this), position);

        uint256 size = Price.divPrice(value, actualOpenPrice);

        uint256 openRebase;
        if (direction == 1) {
            _totalSizeLong = _totalSizeLong.add(size);
            openRebase = _rebaseAccumulatedLong;
        } else {
            _totalSizeShort = _totalSizeShort.add(size);
            openRebase = _rebaseAccumulatedShort;
        }

        _positionIndex++;
        _positions[_positionIndex] = Position(
            actualOpenPrice,
            position,
            size,
            openRebase,
            msgSender,
            direction
        );

        emit OpenPosition(msgSender, _positionIndex, actualOpenPrice, openRebase, direction, leverage, position);
    }

    function addMargin(uint32 positionId, uint256 margin) external override {
        ISystemSettings(_settings).requireSystemActive();
        Position memory p = _positions[positionId];
        require(msg.sender == p.account, "Position Not Match");

        IERC20 poolTokenContract = IERC20(_poolToken);
        require(
            poolTokenContract.allowance(p.account, address(this)) >= margin,
            "Pool Token Approved To Pool Is Not Enough"
        );
        poolTokenContract.safeTransferFrom(p.account, address(this), margin);
        _positions[positionId].margin = p.margin.add(margin);

        emit AddMargin(p.account, positionId, margin);
    }

    function closePosition(uint32 positionId) external override {
        ISystemSettings setting = ISystemSettings(_settings);
        setting.requireSystemActive();

        Position memory p = _positions[positionId];
        require(p.account == msg.sender, "Position Not Match");
        rebase();

        uint closePrice = _getPrice();

        uint pnl = Price.mulPrice(p.size, closePrice.diff(p.openPrice));
        uint fee = setting.mulClosingFee(Price.mulPrice(p.size, closePrice));
        uint fundingFee;

        if (p.direction == 1) {
            fundingFee = Price.calFundingFee(
                p.size.mul(_rebaseAccumulatedLong.sub(p.openRebase)),
                closePrice
            );

            _totalSizeLong = _totalSizeLong.sub(p.size);
        } else {
            fundingFee = Price.calFundingFee(
                p.size.mul(_rebaseAccumulatedShort.sub(p.openRebase)),
                closePrice
            );

            _totalSizeShort = _totalSizeShort.sub(p.size);
        }

        bool isProfit = (closePrice >= p.openPrice) == (p.direction == 1);

        if (isProfit) {
            require(
                p.margin.add(pnl) > fee.add(fundingFee),
                "Bankrupted Liquidation"
            );
        } else {
            require(
                p.margin > pnl.add(fee).add(fundingFee),
                "Bankrupted Liquidation"
            );
        }

        uint256 transferOut = isProfit.addOrSub(p.margin, pnl).sub(fee).sub(
            fundingFee
        );
        if (transferOut >= _liquidityPool.add(p.margin)) {
            transferOut = _liquidityPool.add(p.margin);
        }

        IERC20(_poolToken).safeTransfer(p.account, transferOut);
        _liquidityPool = (!isProfit).addOrSub2Zero(
            _liquidityPool.add(fee).add(fundingFee),
            pnl
        );
        delete _positions[positionId];

        emit ClosePosition(
            p.account,
            positionId,
            closePrice,
            fee,
            fundingFee,
            pnl,
            isProfit
        );
    }

    function liquidate(uint32 positionId) external override {
        ISystemSettings setting = ISystemSettings(_settings);
        setting.requireSystemActive();

        Position memory p = _positions[positionId];
        require(p.account != address(0), "Position Not Match");
        rebase();

        uint liqPrice = _getPrice();
        uint pnl = Price.mulPrice(p.size, liqPrice.diff(p.openPrice));
        uint fee = setting.mulClosingFee(Price.mulPrice(p.size, liqPrice));
        uint fundingFee;

        if (p.direction == 1) {
            fundingFee = Price.calFundingFee(
                p.size.mul(_rebaseAccumulatedLong.sub(p.openRebase)),
                liqPrice
            );

            _totalSizeLong = _totalSizeLong.sub(p.size);
        } else {
            fundingFee = Price.calFundingFee(
                p.size.mul(_rebaseAccumulatedShort.sub(p.openRebase)),
                liqPrice
            );

            _totalSizeLong = _totalSizeShort.sub(p.size);
        }

        bool isProfit = (liqPrice >= p.openPrice) == (p.direction == 1);

        if (isProfit) {
            require(
                p.margin.add(pnl) > fee.add(fundingFee),
                "Position in Burst"
            );
        } else {
            require(
                p.margin > pnl.add(fee).add(fundingFee),
                "Position in Burst"
            );
        }

        require(
            isProfit.addOrSub(p.margin, pnl).sub(fee).sub(fundingFee) <
                setting.mulMarginRatio(p.margin),
            "Position Cannot Be Liquidated by Not Meet MarginRatio"
        );

        uint256 liqReward = isProfit.addOrSub(p.margin, pnl).sub(fee).sub(
            fundingFee
        );
        _liquidityPool = _liquidityPool.add(p.margin.sub(liqReward));
        IERC20(_poolToken).safeTransfer(msg.sender, liqReward);
        delete _positions[positionId];

        emit Liquidate(
            msg.sender,
            positionId,
            liqPrice,
            fee,
            fundingFee,
            liqReward,
            pnl,
            isProfit
        );
    }

    function burst(uint32 positionId) external override {
        ISystemSettings setting = ISystemSettings(_settings);
        setting.requireSystemActive();

        Position memory p = _positions[positionId];
        require(p.account != address(0), "Position Not Match");
        rebase();

        uint liqPrice = _getPrice();
        uint pnl = Price.mulPrice(p.size, liqPrice.diff(p.openPrice));
        uint fee = setting.mulClosingFee(Price.mulPrice(p.size, liqPrice));
        uint fundingFee;

        if (p.direction == 1) {
            fundingFee = Price.calFundingFee(
                p.size.mul(_rebaseAccumulatedLong.sub(p.openRebase)),
                liqPrice
            );

            _totalSizeLong = _totalSizeLong.sub(p.size);
        } else {
            fundingFee = Price.calFundingFee(
                p.size.mul(_rebaseAccumulatedShort.sub(p.openRebase)),
                liqPrice
            );

            _totalSizeLong = _totalSizeShort.sub(p.size);
        }

        bool isProfit = (liqPrice >= p.openPrice) == (p.direction == 1);

        if (isProfit) {
            require(
                p.margin.add(pnl) < fee.add(fundingFee),
                "Position Not Burst"
            );
        } else {
            require(
                p.margin < pnl.add(fee).add(fundingFee),
                "Position Not Burst"
            );
        }

        uint256 liquidateFee = setting.mulLiquidationFee(p.margin);
        _liquidityPool = _liquidityPool.add(p.margin.sub(liquidateFee));
        IERC20(_poolToken).safeTransfer(msg.sender, liquidateFee);
        delete _positions[positionId];

        emit Burst(
            msg.sender,
            positionId,
            liqPrice,
            fee,
            fundingFee,
            liquidateFee,
            pnl,
            isProfit
        );
    }

    function rebase() internal {
        ISystemSettings setting = ISystemSettings(_settings);
        uint256 currBlock = block.number;

        if (_lastRebaseBlock == currBlock) {
            return;
        }

        if (_liquidityPool == 0) {
            _lastRebaseBlock = currBlock;
            return;
        }

        uint256 rebasePrice = _getPrice();
        uint256 nakedPosition = Price.mulPrice(
            _totalSizeLong.diff(_totalSizeShort),
            rebasePrice
        );

        if (!setting.meetImbalanceThreshold(nakedPosition, _liquidityPool)) {
            _lastRebaseBlock = currBlock;
            return;
        }

        uint256 rebaseSize = _totalSizeLong.diff(_totalSizeShort).sub(
            Price.divPrice(
                setting.mulImbalanceThreshold(_liquidityPool),
                rebasePrice
            )
        );

        if (_totalSizeLong > _totalSizeShort) {
            uint256 rebaseDelta = setting.calRebaseDelta(
                rebaseSize.mul(block.number.sub(_lastRebaseBlock)),
                _totalSizeLong
            );

            _rebaseAccumulatedLong = _rebaseAccumulatedLong.add(rebaseDelta);
        } else {
            uint256 rebaseDelta = setting.calRebaseDelta(
                rebaseSize.mul(block.number.sub(_lastRebaseBlock)),
                _totalSizeShort
            );

            _rebaseAccumulatedShort = _rebaseAccumulatedShort.add(rebaseDelta);
        }
        _lastRebaseBlock = currBlock;
    }
}
