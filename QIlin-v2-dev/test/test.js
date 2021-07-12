const { providers, Contract, Wallet, utils, BigNumber } = require('ethers');
const { abi, address, providerAddress, privateKey } = require('./config');

async function test() {
    let overrides = {
        gasLimit: 1000000,
        gasPrice: utils.parseUnits('20.0', 'gwei'),
    };

    let provider = new providers.JsonRpcProvider(providerAddress);
    let network = "42"

    let Rates = new Contract(address(network, 'Rates'), abi('Rates'), provider);
    let result = await Rates.getPrice(overrides)
    console.log(result.toString())
}

test()