// SPDX-License-Identifier: BUSL-1.1
pragma solidity =0.7.6;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";

import "@uniswap/v3-core/contracts/libraries/LowGasSafeMath.sol";
import "@uniswap/v3-core/contracts/libraries/SafeCast.sol";
import "@uniswap/v3-core/contracts/libraries/Tick.sol";
import "@uniswap/v3-core/contracts/libraries/TickBitmap.sol";
import "@uniswap/v3-core/contracts/libraries/Position.sol";
import "@uniswap/v3-core/contracts/libraries/Oracle.sol";

import "@uniswap/v3-core/contracts/libraries/FullMath.sol";
import "@uniswap/v3-core/contracts/libraries/FixedPoint128.sol";
import "@uniswap/v3-core/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import "@uniswap/v3-core/contracts/libraries/LiquidityMath.sol";
import "@uniswap/v3-core/contracts/libraries/SqrtPriceMath.sol";
import "@uniswap/v3-core/contracts/libraries/SwapMath.sol";

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3PoolDeployer.sol";

contract mockUniswapV3Pool is IUniswapV3Pool {
    using LowGasSafeMath for uint256;
    using LowGasSafeMath for int256;
    using SafeCast for uint256;
    using SafeCast for int256;
    using Tick for mapping(int24 => Tick.Info);
    using TickBitmap for mapping(int16 => uint256);
    using Position for mapping(bytes32 => Position.Info);
    using Position for Position.Info;
    using Oracle for Oracle.Observation[65535];

    /// @inheritdoc IUniswapV3PoolImmutables
    address public immutable override factory;
    /// @inheritdoc IUniswapV3PoolImmutables
    address public immutable override token0;
    /// @inheritdoc IUniswapV3PoolImmutables
    address public immutable override token1;
    /// @inheritdoc IUniswapV3PoolImmutables
    uint24 public immutable override fee;

    /// @inheritdoc IUniswapV3PoolImmutables
    int24 public immutable override tickSpacing;

    /// @inheritdoc IUniswapV3PoolImmutables
    uint128 public immutable override maxLiquidityPerTick;

    struct Slot0 {
        // the current price
        uint160 sqrtPriceX96;
        // the current tick
        int24 tick;
        // the most-recently updated index of the observations array
        uint16 observationIndex;
        // the current maximum number of observations that are being stored
        uint16 observationCardinality;
        // the next maximum number of observations to store, triggered in observations.write
        uint16 observationCardinalityNext;
        // the current protocol fee as a percentage of the swap fee taken on withdrawal
        // represented as an integer denominator (1/x)%
        uint8 feeProtocol;
        // whether the pool is locked
        bool unlocked;
    }
    /// @inheritdoc IUniswapV3PoolState
    Slot0 public override slot0;

    /// @inheritdoc IUniswapV3PoolState
    uint256 public override feeGrowthGlobal0X128;
    /// @inheritdoc IUniswapV3PoolState
    uint256 public override feeGrowthGlobal1X128;

    int56[] private tickCumulatives;
    uint160[] private secondsPerLiquidityCumulativeX128s;

    // accumulated protocol fees in token0/token1 units
    struct ProtocolFees {
        uint128 token0;
        uint128 token1;
    }
    /// @inheritdoc IUniswapV3PoolState
    ProtocolFees public override protocolFees;

    /// @inheritdoc IUniswapV3PoolState
    uint128 public override liquidity;

    /// @inheritdoc IUniswapV3PoolState
    mapping(int24 => Tick.Info) public override ticks;
    /// @inheritdoc IUniswapV3PoolState
    mapping(int16 => uint256) public override tickBitmap;
    /// @inheritdoc IUniswapV3PoolState
    mapping(bytes32 => Position.Info) public override positions;
    /// @inheritdoc IUniswapV3PoolState
    Oracle.Observation[65535] public override observations;

    /// @dev Mutually exclusive reentrancy protection into the pool to/from a method. This method also prevents entrance
    /// to a function before the pool is initialized. The reentrancy guard is required throughout the contract because
    /// we use balance checks to determine the payment status of interactions such as mint, swap and flash.
    modifier lock() {
        require(slot0.unlocked, "LOK");
        slot0.unlocked = false;
        _;
        slot0.unlocked = true;
    }

    /// @dev Prevents calling a function from anyone except the address returned by IUniswapV3Factory#owner()
    modifier onlyFactoryOwner() {
        require(msg.sender == IUniswapV3Factory(factory).owner());
        _;
    }

    constructor() {
        int24 _tickSpacing;
        (factory, token0, token1, fee, _tickSpacing) = IUniswapV3PoolDeployer(
            msg.sender
        ).parameters();
        tickSpacing = _tickSpacing;

        maxLiquidityPerTick = Tick.tickSpacingToMaxLiquidityPerTick(
            _tickSpacing
        );
        tickCumulatives.push(0);
        tickCumulatives.push(0);

        secondsPerLiquidityCumulativeX128s.push(0);
        secondsPerLiquidityCumulativeX128s.push(0);
    }

    function setPriceParam(int56 tick, uint160 liquidity) public {
        tickCumulatives[1] = tick;
        secondsPerLiquidityCumulativeX128s[1] = liquidity;
    }

    /// @dev Common checks for valid tick inputs.
    function checkTicks(int24 tickLower, int24 tickUpper) private pure {
        require(tickLower < tickUpper, "TLU");
        require(tickLower >= TickMath.MIN_TICK, "TLM");
        require(tickUpper <= TickMath.MAX_TICK, "TUM");
    }

    /// @dev Returns the block timestamp truncated to 32 bits, i.e. mod 2**32. This method is overridden in tests.
    function _blockTimestamp() internal view virtual returns (uint32) {
        return uint32(block.timestamp); // truncation is desired
    }

    /// @dev Get the pool's balance of token0
    /// @dev This function is gas optimized to avoid a redundant extcodesize check in addition to the returndatasize
    /// check
    function balance0() private view returns (uint256) {
        (bool success, bytes memory data) = token0.staticcall(
            abi.encodeWithSelector(
                IERC20Minimal.balanceOf.selector,
                address(this)
            )
        );
        require(success && data.length >= 32);
        return abi.decode(data, (uint256));
    }

    /// @dev Get the pool's balance of token1
    /// @dev This function is gas optimized to avoid a redundant extcodesize check in addition to the returndatasize
    /// check
    function balance1() private view returns (uint256) {
        (bool success, bytes memory data) = token1.staticcall(
            abi.encodeWithSelector(
                IERC20Minimal.balanceOf.selector,
                address(this)
            )
        );
        require(success && data.length >= 32);
        return abi.decode(data, (uint256));
    }

    /// @inheritdoc IUniswapV3PoolDerivedState
    function snapshotCumulativesInside(int24 tickLower, int24 tickUpper)
        external
        view
        override
        returns (
            int56 tickCumulativeInside,
            uint160 secondsPerLiquidityInsideX128,
            uint32 secondsInside
        )
    {}

    /// @inheritdoc IUniswapV3PoolDerivedState
    function observe(uint32[] calldata secondsAgos)
        external
        view
        override
        returns (
            int56[] memory _tickCumulatives,
            uint160[] memory _secondsPerLiquidityCumulativeX128s
        )
    {
        _tickCumulatives = new int56[](2);
        _secondsPerLiquidityCumulativeX128s = new uint160[](2);

        _tickCumulatives[0] = tickCumulatives[0];
        _tickCumulatives[1] = tickCumulatives[1];
        _secondsPerLiquidityCumulativeX128s[
            0
        ] = secondsPerLiquidityCumulativeX128s[0];
        _secondsPerLiquidityCumulativeX128s[
            1
        ] = secondsPerLiquidityCumulativeX128s[1];
        return (_tickCumulatives, _secondsPerLiquidityCumulativeX128s);
    }

    /// @inheritdoc IUniswapV3PoolActions
    function increaseObservationCardinalityNext(
        uint16 observationCardinalityNext
    ) external override lock {}

    /// @inheritdoc IUniswapV3PoolActions
    /// @dev not locked because it initializes unlocked
    function initialize(uint160 sqrtPriceX96) external override {
        // require(slot0.sqrtPriceX96 == 0, "AI");

        int24 tick = TickMath.getTickAtSqrtRatio(sqrtPriceX96);

        (uint16 cardinality, uint16 cardinalityNext) = observations.initialize(
            _blockTimestamp()
        );

        slot0 = Slot0({
            sqrtPriceX96: sqrtPriceX96,
            tick: tick,
            observationIndex: 0,
            observationCardinality: cardinality,
            observationCardinalityNext: cardinalityNext,
            feeProtocol: 0,
            unlocked: true
        });

        emit Initialize(sqrtPriceX96, tick);
    }

    struct ModifyPositionParams {
        // the address that owns the position
        address owner;
        // the lower and upper tick of the position
        int24 tickLower;
        int24 tickUpper;
        // any change in liquidity
        int128 liquidityDelta;
    }

    /// @dev Effect some changes to a position
    /// @param params the position details and the change to the position's liquidity to effect
    /// @return position a storage pointer referencing the position with the given owner and tick range
    /// @return amount0 the amount of token0 owed to the pool, negative if the pool should pay the recipient
    /// @return amount1 the amount of token1 owed to the pool, negative if the pool should pay the recipient
    function _modifyPosition(ModifyPositionParams memory params)
        private
        view
        returns (
            Position.Info storage position,
            int256 amount0,
            int256 amount1
        )
    {
        position = _updatePosition(
            params.owner,
            params.tickLower,
            params.tickUpper,
            params.liquidityDelta,
            slot0.tick
        );
        amount0 = 0;
        amount1 = 0;
    }

    /// @dev Gets and updates a position with the given liquidity delta
    /// @param owner the owner of the position
    /// @param tickLower the lower tick of the position's tick range
    /// @param tickUpper the upper tick of the position's tick range
    /// @param tick the current tick, passed to avoid sloads
    function _updatePosition(
        address owner,
        int24 tickLower,
        int24 tickUpper,
        int128 liquidityDelta,
        int24 tick
    ) private view returns (Position.Info storage position) {
        position = positions.get(owner, tickLower, tickUpper);
    }

    /// @inheritdoc IUniswapV3PoolActions
    /// @dev  is applied indirectly via _modifyPosition
    function mint(
        address recipient,
        int24 tickLower,
        int24 tickUpper,
        uint128 amount,
        bytes calldata data
    ) external override lock returns (uint256 amount0, uint256 amount1) {}

    //领取费用  只领取已经结算的金额？那样的话就永远领取不完
    /// @inheritdoc IUniswapV3PoolActions
    function collect(
        address recipient,
        int24 tickLower,
        int24 tickUpper,
        uint128 amount0Requested, //要提取的数额
        uint128 amount1Requested //要提取的数额
    ) external override lock returns (uint128 amount0, uint128 amount1) {}

    /// @inheritdoc IUniswapV3PoolActions
    /// @dev  is applied indirectly via _modifyPosition
    function burn(
        int24 tickLower,
        int24 tickUpper,
        uint128 amount
    ) external override lock returns (uint256 amount0, uint256 amount1) {}

    struct SwapCache {
        // the protocol fee for the input token
        uint8 feeProtocol;
        // liquidity at the beginning of the swap
        uint128 liquidityStart;
        // the timestamp of the current block
        uint32 blockTimestamp;
        // the current value of the tick accumulator, computed only if we cross an initialized tick
        int56 tickCumulative;
        // the current value of seconds per liquidity accumulator, computed only if we cross an initialized tick
        uint160 secondsPerLiquidityCumulativeX128;
        // whether we've computed and cached the above two accumulators
        bool computedLatestObservation;
    }

    // the top level state of the swap, the results of which are recorded in storage at the end
    struct SwapState {
        // the amount remaining to be swapped in/out of the input/output asset
        int256 amountSpecifiedRemaining;
        // the amount already swapped out/in of the output/input asset
        int256 amountCalculated;
        // current sqrt(price)
        uint160 sqrtPriceX96;
        // the tick associated with the current price
        int24 tick;
        // the global fee growth of the input token
        uint256 feeGrowthGlobalX128;
        // amount of input token paid as protocol fee
        uint128 protocolFee;
        // the current liquidity in range
        uint128 liquidity;
    }

    struct StepComputations {
        // the price at the beginning of the step
        uint160 sqrtPriceStartX96;
        // the next tick to swap to from the current tick in the swap direction
        int24 tickNext;
        // whether tickNext is initialized or not
        bool initialized;
        // sqrt(price) for the next tick (1/0)
        uint160 sqrtPriceNextX96;
        // how much is being swapped in in this step
        uint256 amountIn;
        // how much is being swapped out
        uint256 amountOut;
        // how much fee is being paid in
        uint256 feeAmount;
    }

    /// @inheritdoc IUniswapV3PoolActions
    function swap(
        address recipient,
        bool zeroForOne,
        int256 amountSpecified,
        uint160 sqrtPriceLimitX96,
        bytes calldata data
    ) external override returns (int256 amount0, int256 amount1) {}

    /// @inheritdoc IUniswapV3PoolActions
    function flash(
        address recipient,
        uint256 amount0,
        uint256 amount1,
        bytes calldata data
    ) external override lock {}

    /// @inheritdoc IUniswapV3PoolOwnerActions
    function setFeeProtocol(uint8 feeProtocol0, uint8 feeProtocol1)
        external
        override
        lock
        onlyFactoryOwner
    {
        require(
            (feeProtocol0 == 0 || (feeProtocol0 >= 4 && feeProtocol0 <= 10)) &&
                (feeProtocol1 == 0 || (feeProtocol1 >= 4 && feeProtocol1 <= 10))
        );
        uint8 feeProtocolOld = slot0.feeProtocol;
        slot0.feeProtocol = feeProtocol0 + (feeProtocol1 << 4);
        emit SetFeeProtocol(
            feeProtocolOld % 16,
            feeProtocolOld >> 4,
            feeProtocol0,
            feeProtocol1
        );
    }

    /// @inheritdoc IUniswapV3PoolOwnerActions
    function collectProtocol(
        address recipient,
        uint128 amount0Requested,
        uint128 amount1Requested
    )
        external
        override
        lock
        onlyFactoryOwner
        returns (uint128 amount0, uint128 amount1)
    {
        amount0 = amount0Requested > protocolFees.token0
            ? protocolFees.token0
            : amount0Requested;
        amount1 = amount1Requested > protocolFees.token1
            ? protocolFees.token1
            : amount1Requested;

        if (amount0 > 0) {
            if (amount0 == protocolFees.token0) amount0--; // ensure that the slot is not cleared, for gas savings
            protocolFees.token0 -= amount0;
            TransferHelper.safeTransfer(token0, recipient, amount0);
        }
        if (amount1 > 0) {
            if (amount1 == protocolFees.token1) amount1--; // ensure that the slot is not cleared, for gas savings
            protocolFees.token1 -= amount1;
            TransferHelper.safeTransfer(token1, recipient, amount1);
        }

        emit CollectProtocol(msg.sender, recipient, amount0, amount1);
    }
}
