pragma solidity 0.7.6;

interface IPool {
    struct Position {
        uint openPrice;
        uint margin;
        uint size;
        uint openRebase;
        address account;
        uint8 direction;
    }

    function lsTokenPrice() external view returns (uint);

    function addLiquidity(uint amount) external;

    function removeLiquidity(uint amount) external;

    function openPosition(uint8 direction, uint16 leverage, uint position) external;

    function addMargin(uint32 positionId, uint margin) external;

    function closePosition(uint32 positionId) external;

    function liquidate(uint32 positionId) external;

    function burst(uint32 positionId) external;

    event AddLiquidity(address indexed sender, uint amount, uint lsAmount);

    event RemoveLiquidity(address indexed sender, uint amount, uint lsAmount);

    event OpenPosition(address indexed sender, uint32 positionId, uint openPrice, uint openRebase,
        uint8 direction, uint16 level, uint position);

    event AddMargin(address indexed sender, uint32 positionId, uint margin);

    event ClosePosition(address indexed sender, uint32 positionId, uint closePrice, uint serviceFee, uint fundingFee, uint pnl, bool isProfit);

    event Liquidate(address indexed sender, uint32 positionId, uint liqPrice, uint serviceFee,
        uint fundingFee, uint liqReward, uint pnl, bool isProfit);

    event Burst(address indexed sender, uint32 positionId, uint liqPrice, uint serviceFee,
        uint fundingFee, uint liqReward, uint pnl, bool isProfit);
}
