const qiFluidity = artifacts.require("qiFluidity");
const coinToken = artifacts.require("coinToken");
const poolToken = artifacts.require("poolToken");

function getAccounts() {
    return new Promise((resolve, reject) => {
        web3.eth.getAccounts((error, accounts) => {
            resolve(accounts);
        });
    });
};


module.exports = async function () {
    try {
        const accounts = await getAccounts();
        const fluidityInstance = await qiFluidity.deployed();
        const coinTokenInstance = await coinToken.deployed();
        const poolTokenInstance = await poolToken.deployed();

        console.log("poolTokenInstance address", poolTokenInstance.address.toString());
        console.log("coinTokenInstance address", coinTokenInstance.address.toString());
        var poolAddress = await fluidityInstance.getPoolAddress();
        var coinAddress = await fluidityInstance.getCoinAddress();
        console.log("poolAddress", poolAddress.toString());
        console.log("coinAddress", coinAddress.toString());

        var poolInfo = await fluidityInstance.getPoolInfo();
        console.log(`poolInfo  ${poolInfo[0]} -----------${poolInfo[1]} -----------${poolInfo[2]} -----------${poolInfo[3]} -----------${poolInfo[4]} -----------${poolInfo[5]}`)

        var poolAmount = await poolTokenInstance.balanceOf(accounts[0]);
        var coinAmount = await coinTokenInstance.balanceOf(accounts[0]);
        console.log("poolAmount", poolAmount.toString());
        console.log("coinAmount", coinAmount.toString());

        var depositInfo = await fluidityInstance.getUserInfo(accounts[0]);
        console.log(`depositInfo  ${depositInfo[0]} -----------${depositInfo[1]} `)
        for (let i = 0; i < parseInt(depositInfo[1]); i++) {
            var depositValue = await fluidityInstance.getUserDepositInfo(accounts[0], i);
            console.log(`depositValue  ${depositValue[0]} -----------${depositValue[1]} `)
        }


        // console.log(`--------------------------------------accountTwo-------------------------------------------------------------`)

        var poolAmountTwo = await poolTokenInstance.balanceOf(accounts[1]);
        var coinAmountTwo = await coinTokenInstance.balanceOf(accounts[1]);
        console.log("poolAmountTwo", poolAmountTwo.toString());
        console.log("coinAmountTwo", coinAmountTwo.toString());

        var depositInfoTwo = await fluidityInstance.getUserInfo(accounts[1]);
        console.log(`depositInfoTwo  ${depositInfoTwo[0]} -----------${depositInfoTwo[1]} `)

        for (let i = 0; i < parseInt(depositInfoTwo[1]); i++) {
            var depositValue = await fluidityInstance.getUserDepositInfo(accounts[1], i);
            console.log(`depositValue  ${depositValue[0]} -----------${depositValue[1]} `)
        }

        // console.log(`--------------------------------------accountThree-------------------------------------------------------------`)

        // var poolAmountThree = await poolTokenInstance.balanceOf(accounts[2]);
        // var coinAmountThree = await coinTokenInstance.balanceOf(accounts[2]);
        // console.log("poolAmountThree", poolAmountThree.toString());
        // console.log("coinAmountThree", coinAmountThree.toString());

        // var depositInfoThree = await fluidityInstance.getUserInfo(accounts[2]);
        // console.log(`depositInfoThree  ${depositInfoThree[0]} -----------${depositInfoThree[1]} `)

    } catch (err) {
        console.log(`fludity  query  error    ${err}`)
        console.error('unexpected error:', err)
        process.exit(1)
    }

    process.exit();
};