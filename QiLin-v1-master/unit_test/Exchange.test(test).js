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

const { deployer } = require("./Exchange.deplay");
const {
  testEnv,
  openPosition,
  initTestDepsForExchange,
} = require("./Exchange.functions");
const { checkOpenPositionThenClose } = require("./Exchange.behavior");

describe("Exchange Basic Test", function () {
  this.timeout(15000);

  const [owner] = accounts;

  beforeEach(async function () {
    deployed = await deployer(owner);
    this.exchange = deployed.exchange;
    this.deps = deployed.deps;
  });

  it("the deployer is the owner", async function () {
    var ow = await  this.exchange.owner()
    console.log("owner is  ",ow)
    expect(await this.exchange.owner()).to.equal(owner);
  });

  it("fundToken get", async function () {
    expect(await this.exchange.fundToken_()).equal(this.deps.FundToken.address);
  });
});

describe("Exchange Contract Basic Test", async function () {
  this.timeout(15000);

  const [owner, alice] = accounts;

  beforeEach(async function () {
    await initTestDepsForExchange(this, owner, [alice]);
  });

  it("open Position event", async function () {
    let openAmt = BigNumber.from("1000000000000000000");
    await this.usdt.approve(this.depot.address, openAmt, { from: alice });

    await this.testAggregator.setState(BigNumber.from("100000000"), 0, 0, {
      from: owner,
    });

    let res = await this.exchange.openPosition(
      deployed.data.currencyKey,
      1,
      5,
      BigNumber.from("1000000000000000000"),
      { from: alice }
    );

    expectEvent(res, "OpenPosition", {
      sender: alice,
      positionId: new BN(1),
      price: new BN("100000000000000000000000000"),
      currencyKey: deployed.data.currencyKey,
      direction: new BN(1),
      level: new BN(5),
      position: new BN("1000000000000000000"),
    });
  });

  it("open Position then close by user", async function () {
    await checkOpenPositionThenClose(
      this,
      alice,
      2,
      10,
      "1000000000000000000",
      async function () { },
      {
        serviceFee: new BN("20000000000000000"),
        marginLoss: new BN(0),
        isProfit: false,
        value: new BN("0"),
      }
    );
  });
});

describe("Exchange Contract Profit Test", async function () {
  this.timeout(90000);

  const [owner, alice] = accounts;

  beforeEach(async function () {
    await initTestDepsForExchange(this, owner, [alice]);
  });

  it("open position and close position with less price", async function () {
    await this.testAggregator.setState(BigNumber.from("100000000"), 0, 0, {
      from: owner,
    });

    await systemSetting.addLeverage(1, { from: owner });

    await checkOpenPositionThenClose(
      this,
      alice,
      2,
      1,
      "1000000000000000000",
      async function (env) {
        await env.testAggregator.setState(BigNumber.from("40000000"), 0, 0, {
          from: owner,
        });
      },
      {
        serviceFee: new BN("2000000000000000"),
        marginLoss: new BN(0),
        isProfit: true,
        value: new BN("600000000000000000"),
      }
    );
  });

  it('open long position then close', async function () {
    await this.testAggregator.setState(BigNumber.from("100000000"), 0, 0, {
      from: owner,
    });

    await systemSetting.addLeverage(3, { from: owner });

    await checkOpenPositionThenClose(
      this,
      alice,
      1,
      3,
      "1000000000000000000",
      async function (env) {
      },
      {
        serviceFee: new BN('6000000000000000'),
        marginLoss: new BN(0),
        isProfit: true,
        value: new BN('0'),
      }
    );
  });


  it('open long position two times ', async function () {
    await this.testAggregator.setState(BigNumber.from("100000000"), 0, 0, {
      from: owner,
    });

    await systemSetting.addLeverage(3, { from: owner });

    await openPosition(new testEnv(this.deployed), alice, 1, 3, '1000000000000000000')
    await openPosition(new testEnv(this.deployed), alice, 1, 3, '1000000000000000000')
  });

  it('open long position then close two times ', async function () {
    await this.testAggregator.setState(BigNumber.from("100000000"), 0, 0, {
      from: owner,
    });

    await systemSetting.addLeverage(3, { from: owner });

    await checkOpenPositionThenClose(
      this,
      alice,
      1,
      3,
      "1000000000000000000",
      async function (env) {
      },
      {
        serviceFee: new BN('6000000000000000'),
        marginLoss: new BN(0),
        isProfit: true,
        value: new BN('0'),
      }
    );
    await checkOpenPositionThenClose(
      this,
      alice,
      1,
      3,
      "1000000000000000000",
      async function (env) {
      },
      {
        serviceFee: new BN('6000000000000000'),
        marginLoss: new BN(0),
        isProfit: true,
        value: new BN('0'),
      }
    );
  });

  it('open long position with different params two times ', async function () {
    await this.testAggregator.setState(BigNumber.from("100000000"), 0, 0, {
      from: owner,
    });

    await systemSetting.addLeverage(1, { from: owner });
    await systemSetting.addLeverage(3, { from: owner });

    await openPosition(new testEnv(this.deployed), alice, 2, 1, '1000000000000000000')
    await openPosition(new testEnv(this.deployed), alice, 1, 3, '1000000000000000000')
  });

  it('open long position with different params two times ', async function () {
    await this.testAggregator.setState(BigNumber.from("100000000"), 0, 0, {
      from: owner,
    });

    await systemSetting.addLeverage(1, { from: owner });
    await systemSetting.addLeverage(3, { from: owner });

    await openPosition(new testEnv(this.deployed), alice, 1, 3, '1000000000000000000')
    await openPosition(new testEnv(this.deployed), alice, 2, 1, '1000000000000000000')
  });

  it('open long position then close with different params two times ', async function () {
    await this.testAggregator.setState(BigNumber.from("100000000"), 0, 0, {
      from: owner,
    });

    await systemSetting.addLeverage(1, { from: owner });
    await systemSetting.addLeverage(3, { from: owner });

    await checkOpenPositionThenClose(
      this,
      alice,
      1,
      3,
      "1000000000000000000",
      async function (env) {
      },
      {
        serviceFee: new BN('6000000000000000'),
        marginLoss: new BN(0),
        isProfit: true,
        value: new BN('0'),
      }
    );
    await checkOpenPositionThenClose(
      this,
      alice,
      2,
      1,
      "1000000000000000000",
      async function (env) {
      },
      {
        serviceFee: new BN('2000000000000000'),
        marginLoss: new BN(0),
        isProfit: false,
        value: new BN('0'),
      }
    );
  });

});



