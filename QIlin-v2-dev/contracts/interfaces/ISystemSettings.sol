pragma solidity 0.7.6;

interface ISystemSettings {

    function leverageExist(uint32 leverage_) external view returns (bool);

    function marginRatio() external view returns (uint);

    function closingFee() external view returns (uint);

    function liquidationFee() external view returns (uint);

    function rebaseCoefficient() external view returns (uint);

    function imbalanceThreshold() external view returns (uint);

    function priceDeviationCoefficient() external view returns (uint);

    function checkOpenPosition(uint16 level) external view;

    function requireSystemActive() external view;
    function resumeSystem() external;
    function suspendSystem() external;

    function mulClosingFee(uint value) external view returns (uint);
    function mulLiquidationFee(uint margin) external view returns (uint);
    function mulMarginRatio(uint margin) external view returns (uint);
    function meetImbalanceThreshold(uint nakedPosition, uint liquidityPool) external view returns (bool);
    function mulImbalanceThreshold(uint liquidityPool) external view returns (uint);
    function calLsAmplificationX18(uint nakedPosition, uint liquidityPool) external view returns (uint);
    function calRebaseDelta(uint rebaseSizeXBlockDelta, uint imbalanceSize) external view returns (uint);

    event Suspend(address indexed sender);
    event Resume(address indexed sender);
}
