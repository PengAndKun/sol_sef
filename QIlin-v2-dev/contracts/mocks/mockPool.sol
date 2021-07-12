pragma solidity 0.7.6;

import "../Pool.sol";
import "../libraries/BasicMaths.sol";
import "../libraries/Price.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../interfaces/ISystemSettings.sol";

contract mockPool is Pool {
    using BasicMaths for uint256;
    using SafeMath for uint256;
    using Price for uint256;
    using SafeERC20 for IERC20;
    using BasicMaths for bool;

    constructor(
        address poolToken,
        address uniPool,
        string memory symbol,
        address settingAddress
    ) Pool(poolToken, uniPool, symbol) {
        _settings = settingAddress;
    }

    function openPositionTest(
        uint8 direction,
        uint16 leverage,
        uint256 position
    ) external {
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

        actualOpenPrice = price;

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

        emit OpenPosition(
            msgSender,
            _positionIndex,
            actualOpenPrice,
            openRebase,
            direction,
            leverage,
            position
        );
    }

    function getPosition(uint32 positionId)
        public
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            address,
            uint8
        )
    {
        Position memory p = _positions[positionId];
        return (
            p.openPrice,
            p.margin,
            p.size,
            p.openRebase,
            p.account,
            p.direction
        );
    }

    function calRebase()
        public
        view
        returns (uint256 rebaseLong, uint256 rebaseShort)
    {
        ISystemSettings setting = ISystemSettings(_settings);
        uint256 currBlock = block.number.add(1);
        rebaseLong = _rebaseAccumulatedLong;
        rebaseShort = _rebaseAccumulatedShort;

        if (_lastRebaseBlock == currBlock) {
            return (rebaseLong, rebaseShort);
        }

        if (_liquidityPool == 0) {
            return (rebaseLong, rebaseShort);
        }

        uint256 rebasePrice = _getPrice();
        uint256 nakedPosition = Price.mulPrice(
            _totalSizeLong.diff(_totalSizeShort),
            rebasePrice
        );

        if (!setting.meetImbalanceThreshold(nakedPosition, _liquidityPool)) {
            return (rebaseLong, rebaseShort);
        }

        uint256 rebaseSize = _totalSizeLong.diff(_totalSizeShort).sub(
            Price.divPrice(
                setting.mulImbalanceThreshold(_liquidityPool),
                rebasePrice
            )
        );

        if (_totalSizeLong > _totalSizeShort) {
            uint256 rebaseDelta = setting.calRebaseDelta(
                rebaseSize.mul(currBlock.sub(_lastRebaseBlock)),
                _totalSizeLong
            );

            rebaseLong = rebaseLong.add(rebaseDelta);
        } else {
            uint256 rebaseDelta = setting.calRebaseDelta(
                rebaseSize.mul(currBlock.sub(_lastRebaseBlock)),
                _totalSizeShort
            );

            rebaseShort = rebaseShort.add(rebaseDelta);
        }
        return (rebaseLong, rebaseShort);
    }

    function calPositionValue(uint32 positionId)
        public
        view
        returns (
            uint256 outValue,
            uint256 fundingFee,
            uint256 servicesFee
        )
    {
        ISystemSettings setting = ISystemSettings(_settings);

        (uint256 rebaseLong, uint256 rebaseShort) = calRebase();
        Position memory p = _positions[positionId];
        uint256 closePrice = _getPrice();
        servicesFee = setting.mulClosingFee(Price.mulPrice(p.size, closePrice));

        if (p.direction == 1) {
            fundingFee = Price.calFundingFee(
                p.size.mul(rebaseLong.sub(p.openRebase)),
                closePrice
            );
            outValue = p
            .margin
            .add(p.size.mulPrice(closePrice))
            .sub2Zero(p.size.mulPrice(p.openPrice))
            .sub2Zero(fundingFee.add(servicesFee));
        } else {
            fundingFee = Price.calFundingFee(
                p.size.mul(rebaseShort.sub(p.openRebase)),
                closePrice
            );
            outValue = p
            .margin
            .add(p.size.mulPrice(p.openPrice))
            .sub2Zero(p.size.mulPrice(closePrice))
            .sub2Zero(fundingFee.add(servicesFee));
        }
        return (outValue, fundingFee, servicesFee);
    }

    function calPositionValue2(uint32 positionId)
        public
        view
        returns (
            uint256 outValue,
            uint256 fundingFee,
            uint256 fee,
            uint256 pnl,
            bool isProfit
        )
    {
        ISystemSettings setting = ISystemSettings(_settings);
        (uint256 rebaseLong, uint256 rebaseShort) = calRebase();
        Position memory p = _positions[positionId];
        uint256 closePrice = _getPrice();
        pnl = Price.mulPrice(p.size, closePrice.diff(p.openPrice));
        fee = setting.mulClosingFee(Price.mulPrice(p.size, closePrice));

        if (p.direction == 1) {
            fundingFee = Price.calFundingFee(
                p.size.mul(rebaseLong.sub(p.openRebase)),
                closePrice
            );
        } else {
            fundingFee = Price.calFundingFee(
                p.size.mul(rebaseShort.sub(p.openRebase)),
                closePrice
            );
        }

        isProfit = (closePrice >= p.openPrice) == (p.direction == 1);
        outValue = isProfit.addOrSub(p.margin, pnl).sub(fee).sub(fundingFee);
        return (outValue, fundingFee, fee, pnl, isProfit);
    }
}
