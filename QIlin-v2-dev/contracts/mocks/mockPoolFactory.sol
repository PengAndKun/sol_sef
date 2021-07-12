pragma solidity 0.7.6;

import "../libraries/StrConcat.sol";
import "../interfaces/IPoolFactory.sol";
import "./mockPool.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "../SystemSettings.sol";

contract mockPoolFactory is IPoolFactory {
    mapping(address => mapping(address => address)) public override pools;

    address internal UNISWAP_V3_FACTORY_ADDRESS; // TODO
    address internal SETTING_ADDRESS;

    constructor(address uniFactoryAddress, address settingAddress) {
        UNISWAP_V3_FACTORY_ADDRESS = uniFactoryAddress;
        SETTING_ADDRESS = settingAddress;
    }

    function createPool(
        address tradeToken,
        address poolToken,
        uint24 fee
    ) external override {
        IUniswapV3Factory uniswap = IUniswapV3Factory(
            UNISWAP_V3_FACTORY_ADDRESS
        );
        address uniPool = uniswap.getPool(tradeToken, poolToken, fee);

        require(uniPool != address(0), "trade pair not found in uni-v3");
        require(pools[poolToken][uniPool] == address(0), "pool already exists");

        string memory tradePair = StrConcat.strConcat(
            ERC20(tradeToken).symbol(),
            ERC20(poolToken).symbol()
        );

        address pool = address(
            new mockPool(poolToken, uniPool, tradePair, SETTING_ADDRESS)
        );
        pools[poolToken][uniPool] = pool;

        emit CreatePool(tradeToken, poolToken, uniPool, pool, tradePair);
    }
}
