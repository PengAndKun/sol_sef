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

        await coinTokenInstance.addControler(fluidityInstance.address, { from: accounts[0] });
        await fluidityInstance.startPool(10, 10000, { from: accounts[0] });


    } catch (err) {
        console.log(`fludity  query  error    ${err}`)
        console.error('unexpected error:', err)
        process.exit(1)
    }

    process.exit();
};