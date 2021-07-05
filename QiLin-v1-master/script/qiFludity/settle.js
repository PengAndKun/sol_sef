const qiFluidity = artifacts.require("qiFluidity");

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

        await fluidityInstance.settle({ from: accounts[2] });

    } catch (err) {
        console.log(`fludity  query  error    ${err}`)
        console.error('unexpected error:', err)
        process.exit(1)
    }

    process.exit();
};