const { providers, Contract, Wallet, utils, BigNumber } = require('ethers');
const { abi, address, providerAddress, privateKey } = require('./config');

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

let chainLinkETHUSD = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"

async function deploy() {
    let provider, wallet, FluidityContract, FluidityWithSigner, ExchangeContract, ExchangeWithSigner,
        LiquidationContract, LiquidationWithSigner, DepotContract, DepotWithSigner,
        ExchangeRatesContract, ExchangeRatesWithSigner, SystemSettingContract, SystemSettingWithSigner;

    provider = new providers.JsonRpcProvider(providerAddress);
    wallet = new Wallet(privateKey, provider);

    ExchangeContract = new Contract(address('Exchange'), abi('Exchange'), provider);
    ExchangeWithSigner = ExchangeContract.connect(wallet);

    FluidityContract = new Contract(address('Fluidity'), abi('Fluidity'), provider);
    FluidityWithSigner = FluidityContract.connect(wallet);

    LiquidationContract = new Contract(address('Liquidation'), abi('Liquidation'), provider);
    LiquidationWithSigner = LiquidationContract.connect(wallet)

    DepotContract = new Contract(address('Depot'), abi('Depot'), provider);
    DepotWithSigner = DepotContract.connect(wallet)

    ExchangeRatesContract = new Contract(address('ExchangeRates'), abi('ExchangeRates'), provider);
    ExchangeRatesWithSigner = ExchangeRatesContract.connect(wallet)

    SystemSettingContract = new Contract(address('SystemSetting'), abi('SystemSetting'), provider);
    SystemSettingWithSigner = SystemSettingContract.connect(wallet)

    let overrides = {
        gasLimit: 1000000,
        gasPrice: utils.parseUnits('25.0', 'gwei'),
    };

    console.log("start")

    // await ExchangeWithSigner.importAddresses(
    //     [
    //         utils.formatBytes32String("FundToken"),
    //         utils.formatBytes32String("SystemSetting"),
    //         utils.formatBytes32String("ExchangeRates"),
    //         utils.formatBytes32String("Depot"),
    //         utils.formatBytes32String("BaseCurrency"),
    //     ],
    //     [
    //         address('FundToken'),
    //         address('SystemSetting'),
    //         address('ExchangeRates'),
    //         address('Depot'),
    //         address('USDC'),
    //     ],
    //     overrides
    // );
    //
    // console.log("1")
    // await sleep(10000);
    // await FluidityWithSigner.importAddresses(
    //     [
    //         utils.formatBytes32String("FundToken"),
    //         utils.formatBytes32String("SystemSetting"),
    //         utils.formatBytes32String("Depot"),
    //         utils.formatBytes32String("BaseCurrency"),
    //     ],
    //     [address('FundToken'), address('SystemSetting'), address('Depot'), address('USDC')],
    //     overrides
    // );
    //
    // console.log("2")
    // await sleep(30000);
    //
    // await LiquidationWithSigner.importAddresses(
    //     [
    //         utils.formatBytes32String("FundToken"),
    //         utils.formatBytes32String("SystemSetting"),
    //         utils.formatBytes32String("ExchangeRates"),
    //         utils.formatBytes32String("Depot"),
    //         utils.formatBytes32String("BaseCurrency"),
    //     ],
    //     [
    //         address('FundToken'),
    //         address('SystemSetting'),
    //         address('ExchangeRates'),
    //         address('Depot'),
    //         address('USDC'),
    //     ],
    //     overrides
    // );
    //
    // console.log("3")
    // await sleep(30000);
    //
    // await DepotWithSigner.importAddresses(
    //   [
    //     utils.formatBytes32String("ExchangeRates"),
    //     utils.formatBytes32String("BaseCurrency"),
    //   ],
    //   [address('ExchangeRates'), address('USDC')],
    //     overrides
    // );
    //
    // console.log("4")
    // await sleep(30000);
    //
    // await ExchangeRatesWithSigner.addCurrencyKey(
    //     utils.formatBytes32String("ETH-USDC"),
    //     chainLinkETHUSD,
    //     overrides
    // );
    //
    // console.log("5")
    // await sleep(10000);

    // await SystemSettingWithSigner.setMaxInitialLiquidityFunding(BigNumber.from("500000000000000000000000"), overrides); // 500,000U

    // await SystemSettingWithSigner.setMinInitialMargin(BigNumber.from("200000000000000000000"), overrides); // 200U
    //
    // console.log("2")
    // await sleep(50000);
    //
    // await SystemSettingWithSigner.setMinAddDeposit(BigNumber.from("200000000000000000000"), overrides); // 200U

    // console.log("3")
    // await sleep(50000);

    // let a = await SystemSettingContract.rebaseRate()
    // console.log(a.toString())

    //
    // await SystemSettingWithSigner.setConstantMarginRatio(BigNumber.from("200000000000000000"), overrides); // 20%
    // await SystemSettingWithSigner.setMarginRatio(BigNumber.from("200000000000000000"), overrides); // 20%
    // await SystemSettingWithSigner.setImbalanceThreshold(BigNumber.from("50000000000000000"), overrides); //  5%
    // await SystemSettingWithSigner.setPositionClosingFee(BigNumber.from("1500000000000000"), overrides); // 0.15%
    // await SystemSettingWithSigner.setLiquidationFee(BigNumber.from("20000000000000000"), overrides); // 2%
    //
    // await SystemSettingWithSigner.addLeverage(2, overrides);
    // await SystemSettingWithSigner.addLeverage(5, overrides);
    // await SystemSettingWithSigner.addLeverage(10, overrides);
    //
    // await SystemSettingWithSigner.setRebaseInterval(28800, overrides); // 8h
    // await SystemSettingWithSigner.setRebaseRate(30, overrides); // 1000
    // TODO 换owner
    // TODO  await SystemSettingWithSigner.resumeSystem(overrides);      // start system
}

async function deployWithCatch() {
    try {
        await deploy()
    } catch (e) {
        console.log(e)
    }
}

deployWithCatch();