pragma solidity 0.7.6;

import "./libraries/BasicMaths.sol";
import "./interfaces/ISystemSettings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract SystemSettings is ISystemSettings, Ownable {
    using SafeMath for uint256;
    using BasicMaths for uint256;
    using BasicMaths for bool;

    mapping(uint32 => bool) private _leverages;
    uint256 private _marginRatio;
    uint256 private _closingFee;
    uint256 private _liquidationFee;
    uint256 private _rebaseCoefficient;
    uint256 private _imbalanceThreshold;
    uint256 private _priceDeviationCoefficient;

    uint256 private constant E4 = 1e4;
    uint256 private constant E18 = 1e18;

    uint256 private constant CLOSING_FEE_MIN = 10; // 10 / 1e4 = 0.1%
    uint256 private constant CLOSING_FEE_MAX = 50; // 50 / 1e4 = 0.5%

    uint256 private constant LIQUIDATION_FEE_MIN = 100; // 100 / 1e4 = 1%
    uint256 private constant LIQUIDATION_FEE_MAX = 500; // 500 / 1e4 = 5%

    uint256 private constant MARGIN_RATIO_MIN = 500; // 500 / 1e4 = 5%
    uint256 private constant MARGIN_RATIO_MAX = 5000; // 5000 / 1e4 = 50%

    uint256 private constant IMBALANCE_THRESHOLD_MIN = 100; // 100 / 1e4 = 1%
    uint256 private constant IMBALANCE_THRESHOLD_MAX = 5000; // 5000 / 1e4 = 50%

    uint256 private constant REBASE_COEFFICIENT_MIN = 20;
    uint256 private constant REBASE_COEFFICIENT_MAX = 60000;

    bool private _active;

    function requireSystemActive() external view override {
        require(_active, "system is suspended");
    }

    function resumeSystem() external override onlyOwner {
        _active = true;
        emit Resume(msg.sender);
    }

    function suspendSystem() external override onlyOwner {
        _active = false;
        emit Suspend(msg.sender);
    }

    function leverageExist(uint32 leverage_)
        external
        view
        override
        returns (bool)
    {
        return _leverages[leverage_];
    }

    function marginRatio() external view override returns (uint256) {
        return _marginRatio;
    }

    function closingFee() external view override returns (uint256) {
        return _closingFee;
    }

    function liquidationFee() external view override returns (uint256) {
        return _liquidationFee;
    }

    function rebaseCoefficient() external view override returns (uint256) {
        return _rebaseCoefficient;
    }

    function imbalanceThreshold() external view override returns (uint256) {
        return _imbalanceThreshold;
    }

    function priceDeviationCoefficient()
        external
        view
        override
        returns (uint256)
    {
        return _priceDeviationCoefficient;
    }

    function checkOpenPosition(uint16 level) external view override {
        require(_active, "system is suspended");
        require(_leverages[level], "Leverage Not Exist");
    }

    function mulClosingFee(uint256 value)
        external
        view
        override
        returns (uint256)
    {
        return _closingFee.mul(value) / E4;
    }

    function mulLiquidationFee(uint256 margin)
        external
        view
        override
        returns (uint256)
    {
        return _liquidationFee.mul(margin) / E4;
    }

    function mulMarginRatio(uint256 margin)
        external
        view
        override
        returns (uint256)
    {
        return _marginRatio.mul(margin) / E4;
    }

    function meetImbalanceThreshold(
        uint256 nakedPosition,
        uint256 liquidityPool
    ) external view override returns (bool) {
        uint256 D = (nakedPosition).mul(E4) / liquidityPool;
        return D > _imbalanceThreshold;
    }

    function mulImbalanceThreshold(uint256 liquidityPool)
        external
        view
        override
        returns (uint256)
    {
        return liquidityPool.mul(_imbalanceThreshold) / E4;
    }

    function calRebaseDelta(
        uint256 rebaseSizeXBlockDelta,
        uint256 imbalanceSize
    ) external view override returns (uint256) {
        return
            rebaseSizeXBlockDelta.mul(E18).div(_rebaseCoefficient).div(
                imbalanceSize
            );
    }

    function calLsAmplificationX18(uint256 nakedPosition, uint256 liquidityPool)
        external
        view
        override
        returns (uint256)
    {
        return
            liquidityPool.mul(_priceDeviationCoefficient).mul(E18) /
            nakedPosition;
    }

    function setMarginRatio(uint256 marginRatio_) external onlyOwner {
        require(marginRatio_ >= MARGIN_RATIO_MIN, "marginRatio should >= 5%");
        require(marginRatio_ <= MARGIN_RATIO_MAX, "marginRatio should <= 50%");

        _marginRatio = marginRatio_;
    }

    function setClosingFee(uint256 closingFee_) external onlyOwner {
        require(closingFee_ >= CLOSING_FEE_MIN, "closingFee should >= 0.1%");
        require(closingFee_ <= CLOSING_FEE_MAX, "closingFee should <= 0.5%");

        _closingFee = closingFee_;
    }

    function setLiquidationFee(uint256 liquidationFee_) external onlyOwner {
        require(
            liquidationFee_ >= LIQUIDATION_FEE_MIN,
            "liquidationFee should >= 1%"
        );
        require(
            liquidationFee_ <= LIQUIDATION_FEE_MAX,
            "liquidationFee should <= 5%"
        );

        _liquidationFee = liquidationFee_;
    }

    function addLeverage(uint32 leverage_) external onlyOwner {
        _leverages[leverage_] = true;
    }

    function deleteLeverage(uint32 leverage_) external onlyOwner {
        _leverages[leverage_] = false;
    }

    function setRebaseCoefficient(uint256 rebaseCoefficient_)
        external
        onlyOwner
    {
        require(
            rebaseCoefficient_ >= REBASE_COEFFICIENT_MIN,
            "rebaseCoefficient should >= 200"
        );
        require(
            rebaseCoefficient_ <= REBASE_COEFFICIENT_MAX,
            "rebaseCoefficient should <= 2000"
        );

        _rebaseCoefficient = rebaseCoefficient_;
    }

    function setImbalanceThreshold(uint256 imbalanceThreshold_)
        external
        onlyOwner
    {
        require(
            imbalanceThreshold_ >= IMBALANCE_THRESHOLD_MIN,
            "imbalanceThreshold should >= 1%"
        );
        require(
            imbalanceThreshold_ <= IMBALANCE_THRESHOLD_MAX,
            "imbalanceThreshold should <= 50%"
        );
        _imbalanceThreshold = imbalanceThreshold_;
    }

    function setPriceDeviationCoefficient(uint256 priceDeviationCoefficient_)
        external
        onlyOwner
    {
        _priceDeviationCoefficient = priceDeviationCoefficient_;
    }
}
