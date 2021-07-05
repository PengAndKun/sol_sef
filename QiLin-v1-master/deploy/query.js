const { providers, Contract, Wallet, utils, BigNumber } = require('ethers');
const { abi, address, providerAddress, privateKey } = require('./config');

async function query() {
    let wallet, provider, ExchangeRatesContract, SystemSettingContract, FluidityContract, DepotContract;

    provider = new providers.JsonRpcProvider(providerAddress);
    wallet = new Wallet(privateKey, provider);

    ExchangeRatesContract = new Contract("0x4a19878950B2E995ed976faa75bF40b9272b3AEb", abi('ExchangeRates'), provider)
        .connect(wallet);
    SystemSettingContract = new Contract("0x5B5EffBf57bbc6241f4566397cC9220e22A214F7", abi('SystemSetting'), provider)
        .connect(wallet);
    FluidityContract = new Contract("0x807E1d5D4E33C3F6a9f5F1bE1da6121ef9feDB92", abi('Fluidity')).connect(wallet)
    DepotContract = new Contract("0x68b43dB860cF0654484c98070AE381d100745a14", abi('Depot')).connect(wallet)


    // let [index, rate] = await ExchangeRatesContract.rateForCurrency(utils.formatBytes32String("ETH-USDC"))
    // console.log(utils.formatEther(rate))

    // await ExchangeRatesContract.deleteCurrencyKey(utils.formatBytes32String("ETH-USDC"))

    let [ml, ms, vl, vs] = await DepotContract.getTotalPositionState()
    console.log(ml.toString(), ms.toString(), vl.toString(), vs.toString())

    // await ExchangeRatesContract.addCurrencyKey(
    //     utils.formatBytes32String("ETH-USDC"),
    //     "0x9326BFA02ADD2366b30bacB125260Af641031331"
    // );

    // await ExchangeRatesContract.transferOwnership("0x0a69E24A82c03841725aCCb83eC122cDC24f6366")


}

query()