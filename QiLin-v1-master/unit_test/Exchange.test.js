const assert = require("assert");
const { providers, Contract, Wallet, utils } = require('ethers');
const { abi, address, providerAddress, privateKey } = require('./config');


describe("test Exchange", async () => {
    let provider, wallet, ExchangeContract, ExchangeWithSigner;

    before(() => {
        provider = new providers.JsonRpcProvider(providerAddress);
        wallet = new Wallet(privateKey, provider);

        ExchangeContract = new Contract(address('SystemStatus'), abi('SystemStatus'), provider);

        ExchangeWithSigner = ExchangeContract.connect(wallet);
    });

    it("resume System", async () => {
    });
});
