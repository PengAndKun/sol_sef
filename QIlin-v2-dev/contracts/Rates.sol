pragma solidity 0.7.6;

import "./interfaces/IRates.sol";
import "./libraries/BasicMaths.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/libraries/TickMath.sol";

contract Rates is IRates {
    using SafeMath for uint256;
    using BasicMaths for uint256;

    IUniswapV3Pool public _uniPool;
    uint32[] private _secondsAgo;
    uint32 private constant OBSERVE_TIME_INTERVAL = 1;
    uint256 private constant E18 = 1e18;

    constructor(address uniPool) {
        _uniPool = IUniswapV3Pool(uniPool);
        _secondsAgo = [OBSERVE_TIME_INTERVAL, 0];
    }

    function getPrice() external view override returns (uint256) {
        return _getPrice();
    }

    // TODO 192精度可能会有问题
    function _getPrice() internal view returns (uint256) {
        (int56[] memory tickCumulatives, ) = _uniPool.observe(_secondsAgo);
        uint256 sqrtPriceX96 = uint256(
            TickMath.getSqrtRatioAtTick(
                int24(tickCumulatives[1] - tickCumulatives[0]) /
                    int24(OBSERVE_TIME_INTERVAL)
            )
        );
        return sqrtPriceX96.mul(sqrtPriceX96).mul(1e10) >> 192;
    }

    function getXY() external view override returns (uint256, uint256) {
        (
            int56[] memory tickCumulatives,
            uint160[] memory secondsPerLiquidityCumulativeX128s
        ) = _uniPool.observe(_secondsAgo);

        uint160 liquidityX128s = (secondsPerLiquidityCumulativeX128s[1] -
            secondsPerLiquidityCumulativeX128s[0]) / OBSERVE_TIME_INTERVAL;
        uint160 sqrtPriceX96 = TickMath.getSqrtRatioAtTick(
            int24(tickCumulatives[1] - tickCumulatives[0]) /
                int24(OBSERVE_TIME_INTERVAL)
        );

        return (
            (liquidityX128s * sqrtPriceX96 * 1e18) >> 160,
            ((sqrtPriceX96 * 1e18) / liquidityX128s) >> 32
        );
    }

    function getLs() external view override returns (uint256) {
        (
            int56[] memory tickCumulatives,
            uint160[] memory secondsPerLiquidityCumulativeX128s
        ) = _uniPool.observe(_secondsAgo);

        uint160 liquidityX128s = (secondsPerLiquidityCumulativeX128s[1] -
            secondsPerLiquidityCumulativeX128s[0]) / OBSERVE_TIME_INTERVAL;
        return (liquidityX128s * liquidityX128s * 1e18) >> 128;
    }

    function _calActualOpenPrice(
        uint256 lsAmplificationX18,
        uint256 value,
        uint8 direction
    ) internal view returns (uint256) {
        (
            int56[] memory tickCumulatives,
            uint160[] memory secondsPerLiquidityCumulativeX128s
        ) = _uniPool.observe(_secondsAgo);

        uint160 liquidityX128s = (secondsPerLiquidityCumulativeX128s[1] -
            secondsPerLiquidityCumulativeX128s[0]) / OBSERVE_TIME_INTERVAL;
        uint160 sqrtPriceX96 = TickMath.getSqrtRatioAtTick(
            int24(tickCumulatives[1] - tickCumulatives[0]) /
                int24(OBSERVE_TIME_INTERVAL)
        );

        // TODO 处理精度
        if (direction == 1) {
            return
                (
                    lsAmplificationX18
                    .sqrt()
                    .mul(((sqrtPriceX96 * 1e18) / liquidityX128s) >> 32)
                    .add(value)
                )
                .pow() / lsAmplificationX18.mul(liquidityX128s);
        } else {
            return
                (
                    lsAmplificationX18
                    .sqrt()
                    .mul(((sqrtPriceX96 * 1e18) / liquidityX128s) >> 32)
                    .sub(value)
                )
                .pow() / lsAmplificationX18.mul(liquidityX128s);
        }
    }
}
