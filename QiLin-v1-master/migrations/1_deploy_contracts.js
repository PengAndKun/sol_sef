const ethers = require('ethers');
const utils = ethers.utils;
const BigNumber = ethers.BigNumber;

const Exchange = artifacts.require("./Exchange.sol");
const Fluidity = artifacts.require("./Fluidity.sol");
const Liquidation = artifacts.require("./Liquidation.sol");
const Depot = artifacts.require("./Depot.sol");
const ExchangeRates = artifacts.require("./ExchangeRates.sol");
const FundToken = artifacts.require("./FundToken.sol");
const USDC = artifacts.require("./USDC.sol");
const SystemSetting = artifacts.require("./SystemSetting.sol");

module.exports = async function (deployer) {
  await deployer.deploy(USDC);
  await deployer.deploy(SystemSetting);
  await deployer.deploy(ExchangeRates);
  await deployer.deploy(Exchange);
  await deployer.deploy(Fluidity);
  await deployer.deploy(Liquidation);
  await deployer.deploy(FundToken, Fluidity.address);
  await deployer.deploy(
    Depot, [Exchange.address, Fluidity.address, Liquidation.address]
  );

  await Exchange.deployed().then(function (instance) {
    return instance.importAddresses(
      [
        utils.formatBytes32String("FundToken"),
        utils.formatBytes32String("SystemSetting"),
        utils.formatBytes32String("ExchangeRates"),
        utils.formatBytes32String("Depot"),
        utils.formatBytes32String("BaseCurrency"),
      ],
      [
        FundToken.address,
        SystemSetting.address,
        ExchangeRates.address,
        Depot.address,
        USDC.address,
      ]
    );
  });

  await Fluidity.deployed().then(function (instance) {
    return instance.importAddresses(
      [
        utils.formatBytes32String("FundToken"),
        utils.formatBytes32String("SystemSetting"),
        utils.formatBytes32String("Depot"),
        utils.formatBytes32String("BaseCurrency"),
      ],
      [FundToken.address, SystemSetting.address, Depot.address, USDC.address]
    );
  });

  await Liquidation.deployed().then(function (instance) {
    return instance.importAddresses(
      [
        utils.formatBytes32String("FundToken"),
        utils.formatBytes32String("SystemSetting"),
        utils.formatBytes32String("ExchangeRates"),
        utils.formatBytes32String("Depot"),
        utils.formatBytes32String("BaseCurrency"),
      ],
      [
        FundToken.address,
        SystemSetting.address,
        ExchangeRates.address,
        Depot.address,
        USDC.address,
      ]
    );
  });

  await Depot.deployed().then(function (instance) {
    return instance.importAddresses(
      [
        utils.formatBytes32String("ExchangeRates"),
        utils.formatBytes32String("BaseCurrency"),
      ],
      [ExchangeRates.address, USDC.address]
    );
  });

  // 000000000000000000 18 0
  await SystemSetting.deployed().then(async function (instance) {
    await instance.setMaxInitialLiquidityFunding(BigNumber.from("500000000000")); // 500,000U
    await instance.setMinInitialMargin(BigNumber.from("200000000")); // 200U
    await instance.setMinAddDeposit(BigNumber.from("200000000")); // 200U

    await instance.setConstantMarginRatio(BigNumber.from("200000000000000000")); // 20%
    await instance.setMarginRatio(BigNumber.from("200000000000000000")); // 20%
    await instance.setImbalanceThreshold(BigNumber.from("50000000000000000")); //  5%
    await instance.setPositionClosingFee(BigNumber.from("1500000000000000")); // 0.15%
    await instance.setLiquidationFee(BigNumber.from("20000000000000000")); // 2%

    await instance.addLeverage(2);
    await instance.addLeverage(5);
    await instance.addLeverage(10);
    await instance.addLeverage(100);

    await instance.setRebaseInterval(28800); // 8h
    await instance.setRebaseRate(30); // 1000
    await instance.resumeSystem();      // start system
  });

  await USDC.deployed().then(async function (instance) {
    await instance.mint(
      "0x89dF9881E22AaE548cE8a97F99e128E7aC1b8F80",
      BigNumber.from("100000000000000")
    );
  });

  await ExchangeRates.deployed().then(async function (instance) {
    await instance.addCurrencyKey(
        utils.formatBytes32String("ETH-USDC"),
        "0x9326BFA02ADD2366b30bacB125260Af641031331"
    );
  });

  await USDC.deployed().then(async function (instance) {
    await instance.approve(
        Depot.address,
        BigNumber.from("1000000000000")
    );
  });

  await Fluidity.deployed().then(async function (instance) {
    await instance.initialFunding(
        BigNumber.from("1000000")
    )
  })

  console.log("USDC -------", USDC.address);
  console.log("FundToken -------", FundToken.address);
  console.log("Exchange -------", Exchange.address);
  console.log("Fluidity -------", Fluidity.address);
  console.log("Liquidation -------", Liquidation.address);
  console.log("Depot -------", Depot.address);
  console.log("ExchangeRates -------", ExchangeRates.address);
  console.log("SystemSetting -------", SystemSetting.address);
};
