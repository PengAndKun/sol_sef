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

const { deployer } = require('./Exchange.deplay');

class testEnv {
  constructor(deployed) {
    this.depot = deployed.deps.Depot;
    this.usdt = deployed.deps.USDT;
    this.exchangeRates = deployed.deps.ExchangeRates;
    this.liquidation = deployed.deps.Liquidation;
    this.fluidity = deployed.deps.Fluidity;
    this.systemSetting = deployed.deps.SystemSetting;
    this.fundToken = deployed.deps.FundToken;
    this.exchange = exchange;
    this.aggregator = testAggregator;

    this.keys = {};
    this.keys[this.usdt.address] = deployed.data.currencyKey;
  }

  getCurrencyKey(currencyAddress) {
    return this.keys[currencyAddress];
  }

  async getUSDT(account) {
    return (await this.usdt.balanceOf(account)).toString(10);
  }
}

async function openPosition(env, account, direction, level, amount, currency) {
  let amt = amount;
  if (typeof str == "string") {
    amt = new BN(amount);
  }

  let depot = env.depot;

  let currencyContract = currency;
  if (currencyContract == null) {
    currencyContract = env.usdt;
  }

  await currencyContract.approve(depot.address, amt, { from: account });

  let currencyKey = env.getCurrencyKey(currencyContract.address);

  let posId = new Number((await this.depot.getCurrPosIdx()).toString(10)) + 1;
  // 10 ** 18
  let price = (await env.aggregator.latestAnswer()).toString(10) + '000000000000000000';

  let res = (await this.exchange.openPosition(
    currencyKey,
    direction,
    level,
    amt,
    { from: account }
  ));

  expectEvent(res, "OpenPosition", {
    sender: account,
    positionId: new BN(posId),
    price: price,
    currencyKey: currencyKey,
    direction: new BN(direction),
    level: new BN(level),
    position: amt,
  });

  return posId;
}

async function initTestDepsForExchange(self, owner, accounts2mint) {
  deployed = await deployer(owner);
  self.exchange = deployed.exchange;
  self.deps = deployed.deps;
  self.usdt = deployed.deps.USDT;
  self.depot = deployed.deps.Depot;
  self.liquidation = deployed.deps.Liquidation;
  self.testAggregator = deployed.aggregator;
  self.aggregator = deployed.aggregator;
  self.systemSetting = deployed.SystemSetting;
  self.data = deployed.data;
  self.deployed = deployed;

  await self.usdt.mint_(
    owner, BigNumber.from('10000000000000000000'), { from: owner });

  for (acc in accounts2mint) {
    await self.usdt.mint_(
      accounts2mint[acc], BigNumber.from('10000000000000000000'), { from: owner })
  }
}

module.exports = {
  testEnv,
  openPosition,
  initTestDepsForExchange,
};
