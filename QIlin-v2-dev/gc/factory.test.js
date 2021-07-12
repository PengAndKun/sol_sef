
const { BN, constants, expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;
const { accounts, contract } = require('@openzeppelin/test-environment');
const { expect } = require('chai');

const { deployer } = require('./share/deployer');
var math = require("mathjs");


const ethers = require('ethers');
const { inTransaction } = require('@openzeppelin/test-helpers/src/expectEvent');
const utils = ethers.utils;
const BigNumber = ethers.BigNumber;


const mockUniswapV3Pool = contract.fromArtifact('mockUniswapV3Pool');

describe('factory Basic Test', function () {
    this.timeout(5000000);

    const [owner, others] = accounts;

    beforeEach(async function () {
        deployed = await deployer(owner);
        this.factoryInstance = deployed.factoryInstance;
        this.uniFactoryInstance = deployed.uniFactoryInstance;
        this.QiInstance = deployed.QiInstance;
        this.usdcInstance = deployed.usdcInstance;

    });

    describe("factory createPool", async function () {

        it('mock uni print pool', async function () {
            await this.uniFactoryInstance.createPool(this.QiInstance.address, this.usdcInstance.address, 3000, { from: owner });
            var poolAddress = await this.uniFactoryInstance.getPool(this.QiInstance.address, this.usdcInstance.address, 3000);
            const uniPoolInstance = await mockUniswapV3Pool.at(poolAddress);
            await uniPoolInstance.setPriceParam(50, BigNumber.from("123454651815154565"));
            var observeInfo = await uniPoolInstance.observe([0]);
            expect(observeInfo[0][0].toString()).to.equal("0");
            expect(observeInfo[0][1].toString()).to.equal("50");
            expect(observeInfo[1][0].toString()).to.equal("0");
            expect(observeInfo[1][1].toString()).to.equal("123454651815154565");

            await uniPoolInstance.setPriceParam(150, BigNumber.from("854697545645456"));
            var observeInfo = await uniPoolInstance.observe([0]);
            expect(observeInfo[0][0].toString()).to.equal("0");
            expect(observeInfo[0][1].toString()).to.equal("150");
            expect(observeInfo[1][0].toString()).to.equal("0");
            expect(observeInfo[1][1].toString()).to.equal("854697545645456");
        });

    });
});