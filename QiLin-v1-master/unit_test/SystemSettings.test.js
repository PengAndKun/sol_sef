const assert = require("assert");
const { providers, Contract, Wallet, utils } = require('ethers');
const { abi, address, providerAddress, privateKey } = require('./config');
const BigNumber = ethers.BigNumber;

describe("test SystemSettings", async () => {
    let provider, wallet, SysSetContract, SysSetWithSigner;

    before(() => {
        provider = new providers.JsonRpcProvider(providerAddress);
        wallet = new Wallet(privateKey, provider);

        SysSetContract = new Contract(address('SystemSetting'), abi('SystemSetting'), provider);

        SysSetWithSigner = SysSetContract.connect(wallet);
    });

    it("set MaxInitAvailableSubscribe", async () => {
        assert.ok(await SysSetWithSigner.setMaxInitAvailableSubscribe(BigNumber.from("10000000000000000000000000")), "OK");
        let maxInit = await SysSetWithSigner.maxInitAvailableSubscribe();
        assert.notEqual(utils.formatEther(maxInit), 0);
        assert.equal(utils.formatEther(maxInit), 10000000);
    });

    it("set MarginToTotalPositionRatio", async () => {
        assert.ok(await SysSetWithSigner.setMarginToTotalPositionRatio(BigNumber.from("200000000000000000")), "OK");
        let r = await SysSetWithSigner.marginToTotalPositionRatio();
        assert.notEqual(utils.formatEther(r), 0);
        assert.equal(utils.formatEther(r), 0.2);
    });

    it("set MinOpenPositionMargin", async () => {
        assert.ok(await SysSetWithSigner.setMinOpenPositionMargin(BigNumber.from("1000000000000000000")), "OK");
        let r = await SysSetWithSigner.minOpenPositionMargin();
        assert.notEqual(utils.formatEther(r), 0);
        assert.equal(utils.formatEther(r), 1);
    });

    it("set MarginRatio", async () => {
        assert.ok(await SysSetWithSigner.setMarginRatio(BigNumber.from("200000000000000000")), "OK");
        let r = await SysSetWithSigner.marginRatio();
        assert.notEqual(utils.formatEther(r), 0);
        assert.equal(utils.formatEther(r), 0.2);
    });

    it("set RebaseRatio", async () => {
        assert.ok(await SysSetWithSigner.setRebaseRatio(BigNumber.from("100000000000000000")), "OK");
        let r = await SysSetWithSigner.rebaseRatio();
        assert.notEqual(utils.formatEther(r), 0);
        assert.equal(utils.formatEther(r), 0.1);
    });

    it("set ClosePositionRatio", async () => {
        assert.ok(await SysSetWithSigner.setClosePositionRatio(BigNumber.from("100000000000000")), "OK");

        let r = await SysSetWithSigner.closePositionRatio();
        assert.notEqual(utils.formatEther(r), 0);
        assert.equal(utils.formatEther(r), 0.0001);
    });

    it("set LiquidateRatio", async () => {
        assert.ok(await SysSetWithSigner.setLiquidateRatio(BigNumber.from("500000000000000")), "OK");
        let r = await SysSetWithSigner.liquidateRatio();
        assert.notEqual(utils.formatEther(r), 0);
        assert.equal(utils.formatEther(r), 0.0005);
    });

    it("set MinMarginCall", async () => {
        assert.ok(await SysSetWithSigner.setMinMarginCall(BigNumber.from("1000000000000000000")), "OK");

        let r = await SysSetWithSigner.minMarginCall();
        assert.notEqual(utils.formatEther(r), 0);
        assert.equal(utils.formatEther(r), 1);
    });

    it("set MinHoldingInterval", async () => {
        assert.ok(await SysSetWithSigner.setMinHoldingInterval(1), "OK");
        let r = await SysSetWithSigner.minHoldingInterval();
        assert.notEqual(r, 0);
        assert.equal(r, 1);
    });

    it("set RebaseInterval", async () => {
        assert.ok(await SysSetWithSigner.setRebaseInterval(1), "OK");
        let r = await SysSetWithSigner.rebaseInterval();
        assert.notEqual(r, 0);
        assert.equal(r, 1);
    });

    it("set RebaseFactor", async () => {
        assert.ok(await SysSetWithSigner.setRebaseFactor(1000), "OK");
        let r = await SysSetWithSigner.rebaseFactor();
        assert.notEqual(r, 0);
        assert.equal(r, 1000);
    });

    it("set Level", async () => {
        assert.ok(await SysSetWithSigner.addLevel(5), "OK");
        assert.ok(await SysSetWithSigner.addLevel(10), "OK");

        assert.equal(await SysSetWithSigner.levelExist(5), true);
        assert.equal(await SysSetWithSigner.levelExist(10), true);
        assert.equal(await SysSetWithSigner.levelExist(18), false);

        assert.ok(await SysSetWithSigner.deleteLevel(10), "OK");
        assert.equal(await SysSetWithSigner.levelExist(10), false);
    });
});
