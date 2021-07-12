const { contract } = require('@openzeppelin/test-environment');

const { BigNumber } = require('ethers')

const PoolFactory = contract.fromArtifact('mockPoolFactory');
const uniFactory = contract.fromArtifact('mockUniswapV3Factory');
const mockToken = contract.fromArtifact('mockToken');
const SystemSettings = contract.fromArtifact('SystemSettings');


// const PoolFactory = contract.fromArtifact('PoolFactory');
// const PoolFactory = contract.fromArtifact('PoolFactory');


module.exports = {
    "deployer": async function (owner) {
        uniFactoryInstance = await uniFactory.new({ from: owner });
        systemSettingsInstance = await SystemSettings.new({ from: owner });

        await systemSettingsInstance.resumeSystem({ from: owner });
        await systemSettingsInstance.addLeverage(2, { from: owner });
        await systemSettingsInstance.addLeverage(5, { from: owner });
        await systemSettingsInstance.addLeverage(10, { from: owner });
        await systemSettingsInstance.addLeverage(20, { from: owner });
        await systemSettingsInstance.setMarginRatio(2000, { from: owner });
        await systemSettingsInstance.setClosingFee(15, { from: owner });
        await systemSettingsInstance.setLiquidationFee(200,{from: owner });
        await systemSettingsInstance.setRebaseCoefficient(50000, { from: owner });
        await systemSettingsInstance.setImbalanceThreshold(500, { from: owner });
        await systemSettingsInstance.setPriceDeviationCoefficient(30, { from: owner });
        factoryInstance = await PoolFactory.new(uniFactoryInstance.address, systemSettingsInstance.address, { from: owner });
        QiInstance = await mockToken.new("QI", "QI", 18, BigNumber.from("1000000000000000000000000000000"), { from: owner });
        usdcInstance = await mockToken.new("USDC", "USDC", 18, BigNumber.from("1000000000000000000000000000000"), { from: owner });

        return {
            "factoryInstance": factoryInstance,
            "uniFactoryInstance": uniFactoryInstance,
            "QiInstance": QiInstance,
            "usdcInstance": usdcInstance
        }
    }
}