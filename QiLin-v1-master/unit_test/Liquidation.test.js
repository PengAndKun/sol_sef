const {
    BN,
    constants,
    expectEvent,
    expectRevert,
} = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;
const { accounts, contract } = require('@openzeppelin/test-environment');
const { expect } = require('chai');

const ethers = require('ethers');
const utils = ethers.utils;
const BigNumber = ethers.BigNumber;

const { deployer } = require('./Exchange.deplay');
const { testEnv, openPosition } = require('./Exchange.functions')

describe('Exchange Benchmark Test', function () {
    this.timeout(15000);

    const [owner, alice, bob, carol, dave, eve, frank] = accounts;

    beforeEach(async function () {
        deployed = await deployer(owner);
        this.exchange = deployed.exchange;
        this.deps = deployed.deps;
        this.usdt = deployed.deps.USDT;
        this.depot = deployed.deps.Depot;
        this.liquidation = deployed.deps.Liquidation;
        this.testAggregator = deployed.aggregator;

        await this.usdt.mint_(
            owner, BigNumber.from('100000000000000000000000'), { from: owner });
        await this.usdt.mint_(
            alice, BigNumber.from('1000000000000000000'), { from: owner });
        await this.usdt.mint_(
            bob, BigNumber.from('1000000000000000000'), { from: owner });
        await this.usdt.mint_(
            carol, BigNumber.from('1000000000000000000'), { from: owner });
        await this.usdt.mint_(
            dave, BigNumber.from('1000000000000000000'), { from: owner });
        await this.usdt.mint_(
            eve, BigNumber.from('1000000000000000000'), { from: owner });

        // some setting
        await systemSetting.setConstantMarginRatio(BigNumber.from("200000000000000000"), { from: owner }); // 20%
        await systemSetting.setMinInitialMargin(BigNumber.from("1000000000000000000"), { from: owner }); // 1U
        await systemSetting.setMarginRatio(BigNumber.from("200000000000000000"), { from: owner }); // 20%
        await systemSetting.setImbalanceThreshold(BigNumber.from("100000000000000000"), { from: owner }); //  10%
        await systemSetting.setPositionClosingFee(BigNumber.from("1000000000000000"), { from: owner }); // 0.01%
        await systemSetting.setLiquidationFee(BigNumber.from("100000000000000000"), { from: owner }); // 0.05%


        this.env = new testEnv(deployed);
    });

    it('bankruptedLiquidate', async function () {

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        let posIDAlice = await openPosition(this.env, alice, 1, 10, '1000000000000000000')
        let posIDBob = await openPosition(this.env, bob, 2, 10, '1000000000000000000')

        // position.leveragedPosition == 10 * 1000000000000000000
        // fee == 1e14 / 1e18 === 0.0001
        // serviceFee === 1e15(1000000000000000)

        // liquidateFeeRatio === 0.0005, liquidateFee == 5e15

        await this.testAggregator.setState(
            BigNumber.from('1000000'), 0, 0, { from: owner });

        console.log("aliceUsdtAmt: ", (await this.env.getUSDT(alice)))
        console.log("bobUsdtAmt: ", (await this.env.getUSDT(bob)))
        let ownerAmt = (await this.env.getUSDT(owner))
        console.log("ownerUsdtAmt: ", ownerAmt)

        let res2 = await this.liquidation.bankruptedLiquidate(posIDAlice, { from: owner });  //bankruptedLiquidate

        console.log("aliceUsdtAmt: ", (await this.env.getUSDT(alice)))
        console.log("bobUsdtAmt: ", (await this.env.getUSDT(bob)))
        let ownerAmt2 = (await this.env.getUSDT(owner))
        console.log("ownerUsdtAmt: ", ownerAmt2)

        //500000000000000

        expectEvent(res2, 'BankruptedLiquidate', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('10000000000000000'),
            marginLoss: new BN(0),
            isProfit: false,
            value: new BN('9900000000000000000'),
        });
    });


});
