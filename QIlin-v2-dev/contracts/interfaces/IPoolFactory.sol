pragma solidity 0.7.6;

interface IPoolFactory {
    function createPool(address tradeToken, address poolToken, uint24 fee) external;

    function pools(address poolToken, address uniPool) external view returns (address pool);

    event CreatePool(
        address tradeToken,
        address poolToken,
        address uniPool,
        address pool,
        string tradePair);
}
