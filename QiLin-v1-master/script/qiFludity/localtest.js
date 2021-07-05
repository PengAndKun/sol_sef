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

        const accountOne = accounts[0];
        const accountTwo = accounts[1];
        const accountThree = accounts[2];


        await coinTokenInstance.addControler(fluidityInstance.address, { from: accountOne });
        await fluidityInstance.startPool(10, 10000000000000, { from: accountOne });
        await fluidityInstance.setWeight(1500, { from: accountOne })

        await poolTokenInstance.approve(fluidityInstance.address, 10000000, { from: accountOne });
        await fluidityInstance.deposit(10000000, { from: accountOne });

        await poolTokenInstance.transfer(accountTwo, 1000000000000000, { from: accountOne });
        await poolTokenInstance.approve(fluidityInstance.address, 1000000000000000, { from: accountTwo });
        for (let i = 0; i < 1000; ++i) {
            await fluidityInstance.deposit(10000, { from: accountTwo });
            console.log(`-------------------------------------------- -----------${i} `)
        }

        await poolTokenInstance.transfer(accountThree, 1000000000000000, { from: accountOne });
        await poolTokenInstance.approve(fluidityInstance.address, 1000000000000000, { from: accountThree });
        for (let i = 0; i < 1000; ++i) {
            await fluidityInstance.deposit(10000, { from: accountThree });
            console.log(`-------------------------------------------- -----------${i} `)
        }

    } catch (err) {
        console.log(`fludity  query  error    ${err}`)
        console.error('unexpected error:', err)
        process.exit(1)
    }

    process.exit();
};