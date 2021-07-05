const {
  BN,
  constants,
  expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");
const { ZERO_ADDRESS } = constants;
const { accounts, contract } = require("@openzeppelin/test-environment");
const { expect } = require("chai");

const ethers = require("ethers");
const utils = ethers.utils;
const BigNumber = ethers.BigNumber;

const TestAggregator = contract.fromArtifact('TestAggregator');

const { deployer } = require("./Exchange.deplay");

describe("Exchange Rates Basic Test", function () {
  this.timeout(15000);

  const [owner, alice, bob] = accounts;

  beforeEach(async function () {
    deployed = await deployer(owner);
    this.exchange = deployed.exchange;
    this.deps = deployed.deps;

    this.testAggregator = await TestAggregator.new({ from: alice });
    this.testAggregator2 = await TestAggregator.new({ from: bob });

    console.log("test aggregator address : ",
      deployed.aggregator.address, ' ',
      this.testAggregator.address, ' ',
      this.testAggregator2.address)
  });

  it("add currency key with address", async function () {
    console.log("add currency key with address ", "kkk", this.testAggregator.address);
    let res1 = await exchangeRates.addCurrencyKey(
      utils.formatBytes32String("kkk"), this.testAggregator.address,
      { from: owner });

    expectEvent(res1, 'AddCurrencyKey', {
      key: utils.formatBytes32String("kkk"),
      aggregator: new BN(this.testAggregator.address),
      idx: new BN(3) // 2 is ck, which 3 will be kkk
    });

    console.log("add currency key with address ", "ccc", this.testAggregator.address);
    let res2 = await exchangeRates.addCurrencyKey(
      utils.formatBytes32String("ccc"), this.testAggregator.address,
      { from: owner });

    expectEvent(res2, 'AddCurrencyKey', {
      key: utils.formatBytes32String("ccc"),
      aggregator: new BN(this.testAggregator.address),
      idx: new BN(4) // 2 is ck, which 3 will be kkk, 4 will be ccc
    });
  });

  it("update currency key", async function () {
    console.log("add currency key with address ", "kkk", this.testAggregator.address);

    expectEvent(
      await exchangeRates.addCurrencyKey(
        utils.formatBytes32String("kkk"),
        this.testAggregator.address,
        { from: owner }
      ),
      "AddCurrencyKey",
      {
        key: utils.formatBytes32String("kkk"),
        aggregator: new BN(this.testAggregator.address),
        idx: new BN(3), // 2 is ck, which 3 will be kkk
      }
    );

    console.log("add currency key with address ", "ccc", this.testAggregator.address);

    expectEvent(
      await exchangeRates.addCurrencyKey(
        utils.formatBytes32String("ccc"),
        this.testAggregator.address,
        { from: owner }
      ),
      "AddCurrencyKey",
      {
        key: utils.formatBytes32String("ccc"),
        aggregator: new BN(this.testAggregator.address),
        idx: new BN(4), // 2 is ck, which 3 will be kkk, 4 will be ccc
      }
    );

    expectEvent(
      await exchangeRates.updateCurrencyKey(
        utils.formatBytes32String("kkk"),
        this.testAggregator2.address,
        { from: owner }
      ),
      "UpdateCurrencyKey",
      {
        key: utils.formatBytes32String("kkk"),
        from: new BN(this.testAggregator.address),
        to: new BN(this.testAggregator2.address),
        idx: new BN(3), // 2 is ck, which 3 will be kkk
      }
    );
  });

  it("delete currency key", async function () {
    expectEvent(
      await exchangeRates.addCurrencyKey(
        utils.formatBytes32String("kkk"),
        this.testAggregator.address,
        { from: owner }
      ),
      "AddCurrencyKey",
      {
        key: utils.formatBytes32String("kkk"),
        aggregator: new BN(this.testAggregator.address),
        idx: new BN(3), // 2 is ck, which 3 will be kkk
      }
    );

    expectEvent(
      await exchangeRates.addCurrencyKey(
        utils.formatBytes32String("ccc"),
        this.testAggregator.address,
        { from: owner }
      ),
      "AddCurrencyKey",
      {
        key: utils.formatBytes32String("ccc"),
        aggregator: new BN(this.testAggregator.address),
        idx: new BN(4), // 2 is ck, which 3 will be kkk, 4 will be ccc
      }
    );

    expectEvent(
      await exchangeRates.deleteCurrencyKey(
        utils.formatBytes32String("kkk"),
        { from: owner }
      ),
      "DelCurrencyKey",
      {
        key: utils.formatBytes32String("kkk"),
        idx: new BN(3), // 2 is ck, which 3 will be kkk
      }
    );

    expectEvent(
      await exchangeRates.deleteCurrencyKey(
        utils.formatBytes32String("ccc"),
        { from: owner }
      ),
      "DelCurrencyKey",
      {
        key: utils.formatBytes32String("ccc"),
        idx: new BN(4), // 2 is ck, which 3 will be kkk
      }
    );
  });
});