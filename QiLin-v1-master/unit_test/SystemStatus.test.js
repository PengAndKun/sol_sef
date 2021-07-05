const assert = require("assert");
const { providers, Contract, Wallet, utils } = require('ethers');
const { abi, address, providerAddress, privateKey } = require('./config');


describe("test SystemStatus", async () => {
    let provider, wallet, SysStaContract, SysStaWithSigner;

    before(() => {
        provider = new providers.JsonRpcProvider(providerAddress);
        wallet = new Wallet(privateKey, provider);

        SysStaContract = new Contract(address('SystemStatus'), abi('SystemStatus'), provider);

        SysStaWithSigner = SysStaContract.connect(wallet);
    });

    it("resume System", async () => {
        assert.ok(await SysStaWithSigner.resumeSystem());
        assert.ok(await SysStaWithSigner.requireSystemActive());
    });
});
