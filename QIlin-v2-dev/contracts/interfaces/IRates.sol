pragma solidity 0.7.6;

interface IRates {
    function getPrice() external view returns (uint);

    function getXY() external view returns (uint, uint);

    function getLs() external view returns (uint);
}