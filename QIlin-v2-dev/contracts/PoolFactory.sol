pragma solidity 0.7.6;

import "./libraries/StrConcat.sol";
import "./interfaces/IPoolFactory.sol";
import "./Pool.sol";
import "./SystemSettings.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";

contract PoolFactory is IPoolFactory, SystemSettings {
    mapping(address => mapping(address => address)) public override pools;

    address private constant UNISWAP_V3_FACTORY_ADDRESS = 0x1F98431c8aD98523631AE4a59f267346ea31F984; // kovan

    function createPool(address tradeToken, address poolToken, uint24 fee) external override {
        IUniswapV3Factory uniswap = IUniswapV3Factory(UNISWAP_V3_FACTORY_ADDRESS);
        address uniPool = uniswap.getPool(tradeToken, poolToken, fee);

        require(uniPool != address(0), "trade pair not found in uni-v3");
        require(pools[poolToken][uniPool] == address(0), "pool already exists");

        string memory tradePair = StrConcat.strConcat(ERC20(tradeToken).symbol(), ERC20(poolToken).symbol());

        address pool = address(new Pool(poolToken, uniPool, tradePair));
        pools[poolToken][uniPool] = pool;

        emit CreatePool(tradeToken, poolToken, uniPool, pool, tradePair);
    }
}
