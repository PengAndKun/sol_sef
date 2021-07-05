const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { accounts, contract } = require('@openzeppelin/test-environment');
const { expect } = require('chai');
const { ZERO_ADDRESS } = constants;

const USDTMock = contract.fromArtifact('USDTMock');

describe('USDT burn', function () {
  const [owner, alice, bob] = accounts;

  beforeEach(async function () {
    this.token = await USDTMock.new({ from: owner });
  });

  it('has a name', async function () {
    expect(await this.token.name()).to.equal("USDC");
  });

  it('has a symbol', async function () {
    expect(await this.token.symbol()).to.equal("USDC");
  });

  it('has 18 decimals', async function () {
    expect(await this.token.decimals()).to.be.bignumber.equal('18');
  });
});