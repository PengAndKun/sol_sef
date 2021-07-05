const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { accounts, contract } = require('@openzeppelin/test-environment');
const { expect } = require('chai');
const { ZERO_ADDRESS } = constants;

const IntTest = contract.fromArtifact('IntTest');

describe('IntTest test params', function () {
  const [owner, alice, bob] = accounts;

  beforeEach(async function () {
    this.testC = await IntTest.new([], { from: owner });
  });

  it('params', async function () {
    res = (await this.testC.testParams())
    console.log(res)
    console.log(res.toString(10))

    /*
  128max   34028236692093846346337460743176821145600
  160max   146150163733090291820368483271628301965593254297500
  168max   37414441915671114706014331717536845303191873100185500
  172max   598631070650737835296229307480589524851069969602969600
     256   115792089237316195423570985008687907853269984665640564039457584007913129639935
     168   374144419156711147060143317175368453031918731001855
     136   87112285931760246646623899502532662132735
     128   340282366920938463463374607431768211455
    */
    res2 = (await this.testC.overflow())
    console.log(res2)
    for (r in res2) {
      console.log(res2[r].toString(10))
    }
  });
});