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

describe("Exchange Benchmark Test", function () {
  this.timeout(20000);

  const [owner, alice, bob] = accounts;

  beforeEach(async function () {
    deployed = await deployer(owner);
    this.exchange = deployed.exchange;
    this.deps = deployed.deps;
    this.usdt = deployed.deps.USDT;
    this.depot = deployed.deps.Depot;
    this.aggregator = deployed.aggregator;

    await this.usdt.mint_(alice, BigNumber.from("100000000000000000000"), {
      from: owner,
    });

    await this.usdt.mint_(bob, BigNumber.from("100000000000000000000"), {
      from: owner,
    });
  });

  it("exchange", async function () {
    let openAmt = BigNumber.from("95000000000000000000");
    await this.usdt.approve(this.depot.address, openAmt, { from: alice });
    await this.usdt.approve(this.depot.address, openAmt, { from: bob });

    let res = await this.exchange.openPosition(
      utils.formatBytes32String("ck"),
      1,
      5,
      BigNumber.from("1000000000000000000"),
      { from: alice }
    );
    console.log("gasUsed alice 1 : ", res.receipt.gasUsed);

    await this.usdt.approve(this.depot.address, openAmt, { from: alice });

    let res2 = await this.exchange.openPosition(
      utils.formatBytes32String("ck"),
      1,
      5,
      BigNumber.from("1000000000000000000"),
      { from: alice }
    );
    console.log("gasUsed alice 2 : ", res2.receipt.gasUsed);

    let res3 = await this.exchange.openPosition(
      utils.formatBytes32String("ck"),
      1,
      5,
      BigNumber.from("1000000000000000000"),
      { from: alice }
    );
    console.log("gasUsed alice 3 : ", res3.receipt.gasUsed);

    let res4 = await this.exchange.openPosition(
      utils.formatBytes32String("ck"),
      1,
      5,
      BigNumber.from("1000000000000000000"),
      { from: alice }
    );
    console.log("gasUsed alice 4 : ", res4.receipt.gasUsed);

    let res5 = await this.exchange.openPosition(
      utils.formatBytes32String("ck"),
      2,
      5,
      BigNumber.from("1000000000000000000"),
      { from: bob }
    );
    console.log("gasUsed bob 5 : ", res5.receipt.gasUsed);

    let res6 = await this.exchange.openPosition(
      utils.formatBytes32String("ck"),
      2,
      5,
      BigNumber.from("1000000000000000000"),
      { from: bob }
    );
    console.log("gasUsed bob 6 : ", res6.receipt.gasUsed);

    let res7 = await this.exchange.openPosition(
      utils.formatBytes32String("ck"),
      2,
      5,
      BigNumber.from("1000000000000000000"),
      { from: bob }
    );
    console.log("gasUsed bob 7 : ", res7.receipt.gasUsed);

    console.log(
      "addDeposit 1 gasUsed: ",
      (
        await this.exchange.addDeposit(
          1,
          BigNumber.from("1000000000000000000"),
          { from: alice }
        )
      ).receipt.gasUsed
    );

    console.log(
      "addDeposit 1 gasUsed: ",
      (
        await this.exchange.addDeposit(
          1,
          BigNumber.from("1000000000000000000"),
          { from: alice }
        )
      ).receipt.gasUsed
    );

    console.log(
      "addDeposit 2 gasUsed: ",
      (
        await this.exchange.addDeposit(
          2,
          BigNumber.from("1000000000000000000"),
          { from: alice }
        )
      ).receipt.gasUsed
    );


    console.log(
      "close 1 gasUsed: ",
      (await this.exchange.closePosition(1, { from: alice })).receipt.gasUsed
    );

    console.log(
      "close 2 gasUsed: ",
      (await this.exchange.closePosition(2, { from: alice })).receipt.gasUsed
    );

    console.log(
      "close 6 gasUsed: ",
      (await this.exchange.closePosition(6, { from: bob })).receipt.gasUsed
    );

    console.log(
      "close 7 gasUsed: ",
      (await this.exchange.closePosition(7, { from: bob })).receipt.gasUsed
    );
  });

  it("liquidation", async function () {
    let openAmt = BigNumber.from("95000000000000000000");
    await this.usdt.approve(this.depot.address, openAmt, { from: alice });
    await this.usdt.approve(this.depot.address, openAmt, { from: bob });

    console.log(
      "gasUsed alice 1 : ",
      (
        await this.exchange.openPosition(
          utils.formatBytes32String("ck"),
          1,
          5,
          BigNumber.from("1000000000000000000"),
          { from: alice }
        )
      ).receipt.gasUsed
    );

    await this.aggregator.setState(1, 0, 0, { from: owner });

    console.log(
      "bankruptedLiquidate by owner 1 : ",
      (
        await this.deps.Liquidation.bankruptedLiquidate(
          1,
          { from: owner }
        )
      ).receipt.gasUsed
    );

  });
});
