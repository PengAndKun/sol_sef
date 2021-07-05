const { BN, expectEvent } = require('@openzeppelin/test-helpers');

const ethers = require('ethers');
const BigNumber = ethers.BigNumber;

async function checkOpenPositionThenClose(env, account, direction, level, openAmtStr, callFunction, expectCloseEvent) {
    let openAmt = new BN(openAmtStr);
    await env.usdt.approve(env.depot.address, openAmt, { from: account })

    let posId = new Number((await env.depot.getCurrPosIdx()).toString(10)) + 1;
    // 10 ** 18
    let price = (await env.aggregator.latestAnswer()).toString(10) + '000000000000000000';

    let res = await env.exchange.openPosition(
        env.data.currencyKey,
        direction,
        level,
        openAmt, { from: account });

    expectEvent(res, 'OpenPosition', {
        sender: account,
        positionId: new BN(posId),
        price: new BN(price),
        currencyKey: env.data.currencyKey,
        direction: new BN(direction),
        level: new BN(level),
        position: openAmt,
    });

    // call callFunction
    callFunction(env)

    let res2 = await env.exchange.closePosition(new BN(posId), { from: account });

    expectCloseEvent.sender = account;
    expectCloseEvent.positionId = new BN(posId);

    expectEvent(res2, 'ClosePosition', expectCloseEvent);
}

module.exports = {
    checkOpenPositionThenClose,
};
