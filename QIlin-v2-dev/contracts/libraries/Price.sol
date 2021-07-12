pragma solidity 0.7.6;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./BasicMaths.sol";

library Price {
    using SafeMath for uint256;
    using BasicMaths for uint256;
    using BasicMaths for bool;

    uint256 private constant E18 = 1e18;
    uint256 private constant E10 = 1e10;

    function lsTokenPrice(uint256 totalSupply, uint256 liquidityPool)
        internal
        pure
        returns (uint256)
    {
        if (totalSupply == 0 || liquidityPool == 0) {
            return E18;
        }

        return liquidityPool.mul(E18) / totalSupply;
    }

    function lsTokenByPoolToken(
        uint256 totalSupply,
        uint256 liquidityPool,
        uint256 poolToken
    ) internal pure returns (uint256) {
        return poolToken.mul(E18) / lsTokenPrice(totalSupply, liquidityPool);
    }

    function divPrice(uint256 value, uint256 price)
        internal
        pure
        returns (uint256)
    {
        return value.mul(E10) / price;
    }

    function mulPrice(uint256 size, uint256 price)
        internal
        pure
        returns (uint256)
    {
        return size.mul(price) / E10;
    }

    function calFundingFee(uint256 rebaseSize, uint256 price)
        internal
        pure
        returns (uint256)
    {
        return mulPrice(rebaseSize.div(E18), price);
    }
}
