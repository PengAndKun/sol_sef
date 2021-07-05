const fluidity = artifacts.require("fluidity");
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
        const fluidityInstance = await fluidity.deployed();
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
        console.log(`depositInfo  ${depositInfo[0]} -----------${depositInfo[1]} -----------${depositInfo[2]}`)

    } catch (err) {
        console.log(`fludity  query  error    ${err}`)
        console.error('unexpected error:', err)
        process.exit(1)
    }

    process.exit();
};