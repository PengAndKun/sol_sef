const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;
const { accounts, contract } = require('@openzeppelin/test-environment');
const { expect } = require('chai');

const { deployer } = require('./Exchange.deplay');

describe('Depot Basic Test', function () {
  this.timeout(5000);

  const [owner, others] = accounts;

  beforeEach(async function () {
    deployed = await deployer(owner);
    console.log("owner is ",owner)
    this.depot = deployed.deps.Depot;
    this.powerAdds = [
      deployed.exchange.address,
      deployed.deps.Fluidity.address,
      deployed.deps.Liquidation.address];
  });

  it('power get ok', async function () {
    for (var a in powerAdds) {
      console.log("get power ", powerAdds[a]);
      expect(await this.depot.getPower_(powerAdds[a])).to.be.bignumber.equal('1')
    }
  });

  it('power get not has', async function () {
    expect(await this.depot.getPower_(others)).to.be.bignumber.equal('0')
  });
});