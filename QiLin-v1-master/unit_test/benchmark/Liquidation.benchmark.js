const {
  BN,
  constants,
  expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");
const { ZERO_ADDRESS } = constants;
const { accounts, contract } = require("@openzeppelin/test-environment");
const { expect } = require("chai");

const ethers = require('ethers');
const utils = ethers.utils;
const BigNumber = ethers.BigNumber;

const { deployer } = require("../Exchange.deplay");

describe("Liquidation Benchmark Test", function () {
  this.timeout(20000);

  const [owner, alice, bob] = accounts;

  beforeEach(async function () {
    deployed = await deployer(owner);
    this.exchange = deployed.exchange;
    this.deps = deployed.deps;
    this.usdt = deployed.deps.USDT;
    this.depot = deployed.deps.Depot;
    this.liquidation = deployed.deps.Liquidation;
    this.aggregator = deployed.aggregator;

    await this.usdt.mint_(alice, BigNumber.from("100000000000000000000"), {
      from: owner,
    });

    await this.usdt.mint_(bob, BigNumber.from("100000000000000000000"), {
      from: owner,
    });
  });

  it("liquidation", async function () {
    let openAmt = BigNumber.from("95000000000000000000");
    await this.usdt.approve(this.depot.address, openAmt, { from: alice });
    await this.usdt.approve(this.depot.address, openAmt, { from: bob });

    await this.aggregator.setState(
      BigNumber.from('100000000'), 0, 0, { from: owner });

    let res = await this.exchange.openPosition(
      utils.formatBytes32String("ck"),
      1,
      10,
      BigNumber.from("1000000000000000000"),
      { from: alice }
    );
    console.log("openPosition gasUsed alice 1 : ", res.receipt.gasUsed);

    let res2 = await this.exchange.openPosition(
      utils.formatBytes32String("ck"),
      1,
      10,
      BigNumber.from("1000000000000000000"),
      { from: alice }
    );
    console.log("openPosition gasUsed alice 2 : ", res2.receipt.gasUsed);

    let res3 = await this.exchange.openPosition(
      utils.formatBytes32String("ck"),
      1,
      10,
      BigNumber.from("1000000000000000000"),
      { from: alice }
    );
    console.log("openPosition gasUsed alice 3 : ", res3.receipt.gasUsed);

    let res4 = await this.exchange.openPosition(
      utils.formatBytes32String("ck"),
      1,
      10,
      BigNumber.from("1000000000000000000"),
      { from: alice }
    );
    console.log("openPosition gasUsed alice 4 : ", res4.receipt.gasUsed);

    let res5 = await this.exchange.openPosition(
      utils.formatBytes32String("ck"),
      2,
      10,
      BigNumber.from("1000000000000000000"),
      { from: bob }
    );
    console.log("openPosition gasUsed bob 5 : ", res5.receipt.gasUsed);

    let res6 = await this.exchange.openPosition(
      utils.formatBytes32String("ck"),
      2,
      10,
      BigNumber.from("1000000000000000000"),
      { from: bob }
    );
    console.log("openPosition gasUsed bob 6 : ", res6.receipt.gasUsed);

    let res7 = await this.exchange.openPosition(
      utils.formatBytes32String("ck"),
      2,
      10,
      BigNumber.from("1000000000000000000"),
      { from: bob }
    );
    console.log("openPosition gasUsed bob 7 : ", res7.receipt.gasUsed);

    //     100000000
    // -->  99000000
    await this.aggregator.setState(BigNumber.from('92000000'), 0, 0, { from: owner });

    resLiqStat = (await this.liquidation.getLiquidationStat(1));
    for (r in resLiqStat) {
      console.log(resLiqStat[r].toString(10))
    }

    console.log(
      "liquidation 1 gasUsed: ",
      (await this.liquidation.liquidate(1, { from: owner })).receipt.gasUsed
    );

    console.log(
      "liquidation 2 gasUsed: ",
      (await this.liquidation.liquidate(2, { from: owner })).receipt.gasUsed
    );

    await this.aggregator.setState(
      BigNumber.from('10000000000'), 0, 0, { from: owner });

    console.log(
      "liquidation 6 gasUsed: ",
      (await this.liquidation.bankruptedLiquidate(6, { from: owner })).receipt.gasUsed
    );

    console.log(
      "liquidation 7 gasUsed: ",
      (await this.liquidation.bankruptedLiquidate(7, { from: owner })).receipt.gasUsed
    );
  });
});