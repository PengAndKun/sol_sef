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

const { deployer } = require('../Exchange.deplay');

describe('Exchange Benchmark Test', function () {
    this.timeout(10000000);

    const [owner, alice] = accounts;

    beforeEach(async function () {
        deployed = await deployer(owner);
        this.exchange = deployed.exchange;
        this.deps = deployed.deps;
        this.usdt = deployed.deps.USDT;
        this.depot = deployed.deps.Depot;
        this.liquidation = deployed.deps.Liquidation;
        this.testAggregator = deployed.aggregator;
        // this.systemSetting = deployed.SystemSetting;

        await this.usdt.mint_(
            owner, BigNumber.from('10000000000000000000'), { from: owner });
        await this.usdt.mint_(
            alice, BigNumber.from('10000000000000000000'), { from: alice })
    });

    it('openPosition 9', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(3, { from: owner });
        await systemSetting.addLeverage(1, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 3,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(3),
            position: new BN('1000000000000000000'),
        });


        let res = await this.exchange.openPosition(
            deployed.data.currencyKey, 2, 1,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res, 'OpenPosition', {
            sender: owner,
            positionId: new BN(2),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(2),
            level: new BN(1),
            position: new BN('1000000000000000000'),
        });
        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('6000000000000000'),
            marginLoss: new BN(0),
            isProfit: true,
            value: new BN('0'),
        });
        let res21 = await this.exchange.closePosition(2, { from: owner });

        expectEvent(res21, 'ClosePosition', {
            sender: owner,
            positionId: new BN(2),
            serviceFee: new BN('2000000000000000'),
            marginLoss: new BN(0),
            isProfit: false,
            value: new BN('0'),
        });
    });


    it('openPosition 10', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(3, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 3,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(3),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('200000000'), 0, 0, { from: owner });

        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('6000000000000000'),
            marginLoss: new BN(0),
            isProfit: true,
            value: new BN('3000000000000000000'),
        });
    });

    it('openPosition 11', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(3, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 3,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(3),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('90000000'), 0, 0, { from: owner });

        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('6000000000000000'),
            marginLoss: new BN(0),
            isProfit: false,
            value: new BN('300000000000000000'),
        });
    });

    it('openPosition 12', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(2, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 2,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(2),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('55000000'), 0, 0, { from: owner });

        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('4000000000000000'),
            marginLoss: new BN(0),
            isProfit: false,
            value: new BN('900000000000000000'),
        });
    });

    it('openPosition 13', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(2, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 2,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(2),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('53000000'), 0, 0, { from: owner });

        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('4000000000000000'),
            marginLoss: new BN(0),
            isProfit: false,
            value: new BN('940000000000000000'),
        });
    });

    it('openPosition 14', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(2, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 2,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(2),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('52000000'), 0, 0, { from: owner });

        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('4000000000000000'),
            marginLoss: new BN(0),
            isProfit: false,
            value: new BN('960000000000000000'),
        });
    });

    it('openPosition 15', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(2, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 2,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(2),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('51000000'), 0, 0, { from: owner });

        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('4000000000000000'),
            marginLoss: new BN(0),
            isProfit: false,
            value: new BN('980000000000000000'),
        });
    });

    it('openPosition 16', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(2, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 2, 2,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(2),
            level: new BN(2),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('110000000'), 0, 0, { from: owner });

        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('4000000000000000'),
            marginLoss: new BN(0),
            isProfit: false,
            value: new BN('200000000000000000'),
        });
    });

    it('openPosition 17', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(2, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 2, 2,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(2),
            level: new BN(2),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('140000000'), 0, 0, { from: owner });

        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('4000000000000000'),
            marginLoss: new BN(0),
            isProfit: false,
            value: new BN('800000000000000000'),
        });
    });


    it('openPosition 17.1', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(2, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 2, 2,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(2),
            level: new BN(2),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('143000000'), 0, 0, { from: owner });

        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('4000000000000000'),
            marginLoss: new BN(0),
            isProfit: false,
            value: new BN('860000000000000000'),
        });
    });

    it('openPosition 18', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(2, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 2, 2,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(2),
            level: new BN(2),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('146000000'), 0, 0, { from: owner });

        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('4000000000000000'),
            marginLoss: new BN(0),
            isProfit: false,
            value: new BN('920000000000000000'),
        });
    });

    it('openPosition 19', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(2, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 2, 2,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(2),
            level: new BN(2),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('148000000'), 0, 0, { from: owner });

        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('4000000000000000'),
            marginLoss: new BN(0),
            isProfit: false,
            value: new BN('960000000000000000'),
        });
    });


    it('openPosition 20', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(2, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 2, 2,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(2),
            level: new BN(2),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('149000000'), 0, 0, { from: owner });

        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('4000000000000000'),
            marginLoss: new BN(0),
            isProfit: false,
            value: new BN('980000000000000000'),
        });
    });


    it('openPosition 21', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(3, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 3,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(3),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('200000000'), 0, 0, { from: owner });


        this.exchange.rebase({ from: alice });

        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('6000000000000000'),
            marginLoss: new BN('0'),
            isProfit: true,
            value: new BN('3000000000000000000'),
        });
    });

    it('openPosition 22', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(3, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 3,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(3),
            position: new BN('1000000000000000000'),
        });


        await this.testAggregator.setState(
            BigNumber.from('90000000'), 0, 0, { from: owner });

        this.exchange.rebase({ from: alice });

        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('6000000000000000'),
            marginLoss: new BN('0'),
            isProfit: false,
            value: new BN('300000000000000000'),
        });
    });

    it('openPosition 23', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(2, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 2,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(2),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('55000000'), 0, 0, { from: owner });

        this.exchange.rebase({ from: alice });

        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('4000000000000000'),
            marginLoss: new BN('0'),
            isProfit: false,
            value: new BN('900000000000000000'),
        });
    });

    it('openPosition 24', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(2, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 2,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(2),
            position: new BN('1000000000000000000'),
        });

        this.exchange.rebase({ from: alice });
        await this.testAggregator.setState(
            BigNumber.from('53000000'), 0, 0, { from: owner });

        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('4000000000000000'),
            marginLoss: new BN('0'),
            isProfit: false,
            value: new BN('940000000000000000'),
        });
    });

    it('openPosition 25', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(2, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 2,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(2),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('52000000'), 0, 0, { from: owner });


        this.exchange.rebase({ from: alice });
        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('4000000000000000'),
            marginLoss: new BN('0'),
            isProfit: false,
            value: new BN('960000000000000000'),
        });
    });

    it('openPosition 26', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(2, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 2,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(2),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('51000000'), 0, 0, { from: owner });
        this.exchange.rebase({ from: alice });
        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('4000000000000000'),
            marginLoss: new BN('0'),
            isProfit: false,
            value: new BN('980000000000000000'),
        });
    });

    it('openPosition 27', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(2, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 2, 2,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(2),
            level: new BN(2),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('110000000'), 0, 0, { from: owner });
        this.exchange.rebase({ from: alice });
        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('4000000000000000'),
            marginLoss: new BN('0'),
            isProfit: false,
            value: new BN('200000000000000000'),
        });
    });

    it('openPosition 28', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(2, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 2, 2,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(2),
            level: new BN(2),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('140000000'), 0, 0, { from: owner });
        this.exchange.rebase({ from: alice });
        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('4000000000000000'),
            marginLoss: new BN('0'),
            isProfit: false,
            value: new BN('800000000000000000'),
        });
    });


    it('openPosition 29', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(2, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 2, 2,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(2),
            level: new BN(2),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('143000000'), 0, 0, { from: owner });
        this.exchange.rebase({ from: alice });
        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('4000000000000000'),
            marginLoss: new BN('0'),
            isProfit: false,
            value: new BN('860000000000000000'),
        });
    });

    it('openPosition 30', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(2, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 2, 2,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(2),
            level: new BN(2),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('146000000'), 0, 0, { from: owner });

        this.exchange.rebase({ from: alice });
        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('4000000000000000'),
            marginLoss: new BN('0'),
            isProfit: false,
            value: new BN('920000000000000000'),
        });
    });

    it('openPosition 31', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(2, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 2, 2,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(2),
            level: new BN(2),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('148000000'), 0, 0, { from: owner });

        this.exchange.rebase({ from: alice });
        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('4000000000000000'),
            marginLoss: new BN('0'),
            isProfit: false,
            value: new BN('960000000000000000'),
        });
    });


    it('openPosition 32', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(2, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 2, 2,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(2),
            level: new BN(2),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('149000000'), 0, 0, { from: owner });
        this.exchange.rebase({ from: alice });
        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('4000000000000000'),
            marginLoss: new BN('0'),
            isProfit: false,
            value: new BN('980000000000000000'),
        });
    });


    it('openPosition 33', async function () {
        let openAmt = BigNumber.from('1000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner })

        let res = await this.exchange.openPosition(
            deployed.data.currencyKey, 2, 10,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('10000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(2),
            level: new BN(10),
            position: new BN('1000000000000000000'),
        });

        this.exchange.rebase({ from: alice });
        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('20000000000000000'),
            marginLoss: new BN('0'),
            isProfit: false,
            value: new BN('0'),
        });
    });


    it('openPosition 34', async function () {
        let openAmt = BigNumber.from('1000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(1, { from: owner });
        let res = await this.exchange.openPosition(
            deployed.data.currencyKey, 2, 1,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(2),
            level: new BN(1),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('40000000'), 0, 0, { from: owner });

        this.exchange.rebase({ from: alice });
        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('2000000000000000'),
            marginLoss: new BN('0'),
            isProfit: true,
            value: new BN('600000000000000000'),
        });
    });


    it('openPosition 35', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });


        await systemSetting.addLeverage(3, { from: owner });
        let res = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 3,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(3),
            position: new BN('1000000000000000000'),
        });

        this.exchange.rebase({ from: alice });
        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('6000000000000000'),
            marginLoss: new BN('0'),
            isProfit: true,
            value: new BN('0'),
        });
    });

    it('openPosition 36', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });


        await systemSetting.addLeverage(3, { from: owner });
        let res = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 3,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(3),
            position: new BN('1000000000000000000'),
        });

        this.exchange.rebase({ from: alice });
        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 3,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(2),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(3),
            position: new BN('1000000000000000000'),
        });
    });


    it('openPosition 37', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });


        await systemSetting.addLeverage(3, { from: owner });
        let res = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 3,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(3),
            position: new BN('1000000000000000000'),
        });

        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('6000000000000000'),
            marginLoss: new BN(0),
            isProfit: true,
            value: new BN('0'),
        });

        this.exchange.rebase({ from: alice });
        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 3,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(2),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(3),
            position: new BN('1000000000000000000'),
        });

        let res21 = await this.exchange.closePosition(2, { from: owner });

        expectEvent(res21, 'ClosePosition', {
            sender: owner,
            positionId: new BN(2),
            serviceFee: new BN('6000000000000000'),
            marginLoss: new BN(0),
            isProfit: true,
            value: new BN('0'),
        });
    });

    it('openPosition 38', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(1, { from: owner });
        await systemSetting.addLeverage(3, { from: owner });

        let res = await this.exchange.openPosition(
            deployed.data.currencyKey, 2, 1,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(2),
            level: new BN(1),
            position: new BN('1000000000000000000'),
        });

        this.exchange.rebase({ from: alice });
        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 3,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(2),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(3),
            position: new BN('1000000000000000000'),
        });
    });


    it('openPosition 39', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(3, { from: owner });
        await systemSetting.addLeverage(1, { from: owner });
        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 3,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(3),
            position: new BN('1000000000000000000'),
        });

        this.exchange.rebase({ from: alice });
        let res = await this.exchange.openPosition(
            deployed.data.currencyKey, 2, 1,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res, 'OpenPosition', {
            sender: owner,
            positionId: new BN(2),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(2),
            level: new BN(1),
            position: new BN('1000000000000000000'),
        });
    });

    it('openPosition 40', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(3, { from: owner });
        await systemSetting.addLeverage(1, { from: owner });
        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 3,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(3),
            position: new BN('1000000000000000000'),
        });

        this.exchange.rebase({ from: alice });

        let res = await this.exchange.openPosition(
            deployed.data.currencyKey, 2, 1,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res, 'OpenPosition', {
            sender: owner,
            positionId: new BN(2),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(2),
            level: new BN(1),
            position: new BN('1000000000000000000'),
        });
        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('6000000000000000'),
            marginLoss: new BN('0'),
            isProfit: true,
            value: new BN('0'),
        });
        let res21 = await this.exchange.closePosition(2, { from: owner });

        expectEvent(res21, 'ClosePosition', {
            sender: owner,
            positionId: new BN(2),
            serviceFee: new BN('2000000000000000'),
            marginLoss: new BN(0),
            isProfit: false,
            value: new BN('0'),
        });
    });

    it('openPosition 40.1', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(3, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 3,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(3),
            position: new BN('1000000000000000000'),
        });


        await systemSetting.addLeverage(1, { from: owner });

        let res = await this.exchange.openPosition(
            deployed.data.currencyKey, 2, 1,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res, 'OpenPosition', {
            sender: owner,
            positionId: new BN(2),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(2),
            level: new BN(1),
            position: new BN('1000000000000000000'),
        });
        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('6000000000000000'),
            marginLoss: new BN(0),
            isProfit: true,
            value: new BN('0'),
        });
        let res21 = await this.exchange.closePosition(2, { from: owner });
        this.exchange.rebase({ from: alice });

        expectEvent(res21, 'ClosePosition', {
            sender: owner,
            positionId: new BN(2),
            serviceFee: new BN('2000000000000000'),
            marginLoss: new BN(0),
            isProfit: false,
            value: new BN('0'),
        });
    });


    it('openPosition 41', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(3, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 3,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(3),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('200000000'), 0, 0, { from: owner });
        this.exchange.rebase({ from: alice });
        let res2 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res2, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('6000000000000000'),
            marginLoss: new BN('0'),
            isProfit: true,
            value: new BN('3000000000000000000'),
        });
    });


    it('openPosition 42', async function () {
        let openAmt = BigNumber.from('2000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(3, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 3,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(3),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('10000000'), 0, 0, { from: owner });

        let res2 = await this.liquidation.bankruptedLiquidate(1, { from: alice });  //bankruptedLiquidate

        expectEvent(res2, 'BankruptedLiquidate', {
            sender: alice,
            positionId: new BN(1),
            serviceFee: new BN('6000000000000000'),
            marginLoss: new BN(0),
            isProfit: false,
            value: new BN('2700000000000000000'),
        });
    });


    it('openPosition 43', async function () {
        let openAmt = BigNumber.from('2000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('100000000'), 0, 0, { from: owner });

        await systemSetting.addLeverage(3, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 3,
            BigNumber.from('1000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('100000000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(3),
            position: new BN('1000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('1'), 0, 0, { from: owner });

        let res2 = await this.liquidation.bankruptedLiquidate(1, { from: alice });  //bankruptedLiquidate

        expectEvent(res2, 'BankruptedLiquidate', {
            sender: alice,
            positionId: new BN(1),
            serviceFee: new BN('6000000000000000'),
            marginLoss: new BN(0),
            isProfit: false,
            value: new BN('2999999970000000000'),
        });
    });
});
