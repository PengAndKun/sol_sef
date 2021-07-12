
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
const mockPool = contract.fromArtifact('mockPool');

async function advanceblock(advanceNumber) {
    var currentBlock = await time.latestBlock();
    var target = parseInt(currentBlock) + advanceNumber;
    await time.advanceBlockTo(target)
}


describe('close position Basic Test', function () {
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

        //测试平仓：初始步骤
        /**
        1.创建交易对，并给出初始价格(这一步是否放到Share里面稍后整理)
        2.创建池子
        3.流动性池子充值完毕
        4.创建需要平仓的单子
        5.构造平仓时的环境，并记录平仓前的环境
        6.进行平仓操作
        7.对比平仓后合约环境的变化
        */
        var pairAddress;//创建交易对
        beforeEach(async function () {
            await this.uniFactoryInstance.createPool(this.QiInstance.address, this.usdcInstance.address, 3000, { from: owner });
            pairAddress = await this.uniFactoryInstance.getPool(this.QiInstance.address, this.usdcInstance.address, 3000);
            const uniPoolInstance = await mockUniswapV3Pool.at(pairAddress);
            await uniPoolInstance.setPriceParam(69081, BigNumber.from("123454651815154565"));//1.0001^69071 = 999.999339043
        });
        var poolAddress;
        //创建池子
        beforeEach(async function () {
            await this.factoryInstance.createPool(this.QiInstance.address, this.usdcInstance.address, 3000, { from: owner });
            poolAddress = await this.factoryInstance.pools(this.usdcInstance.address, pairAddress);

        });
        var poolInstance;
        //池子创建初始流动性
        beforeEach(async function () {
            poolInstance = await mockPool.at(poolAddress);
            var liquidityAmount = BigNumber.from("20000000000000000000000");
            await this.usdcInstance.approve(poolAddress, liquidityAmount, { from: owner });
            await poolInstance.addLiquidity(liquidityAmount, { from: owner });
        });

        //开仓
        beforeEach(async function () {
            var marginAmount = BigNumber.from("1000000000000000000000");
            await this.usdcInstance.transfer(others, marginAmount, { from: owner });
            await this.usdcInstance.approve(poolAddress, marginAmount, { from: others });
            var openAmount = BigNumber.from("500000000000000000000");
            await poolInstance.openPositionTest(2, 10, openAmount, { from: others });
            await poolInstance.addMargin(1, openAmount, { from: others });
        });

        it('check after close position', async function () {
            var positionInfo = await poolInstance.getPosition(1);
            expect(positionInfo[0].toString()).to.eq("9999993390433", "position openPrice is valid");
            expect(positionInfo[1].toString()).to.eq("1000000000000000000000", "position margin is valid");
            expect(positionInfo[2].toString()).to.eq("5000003304785684320", "position size is valid");
            expect(positionInfo[3].toString()).to.eq("0", "position rebase is valid");
            expect(positionInfo[4].toString()).to.eq(others.toString(), "position owner is valid");
            expect(positionInfo[5].toString()).to.eq("2", "position direction is valid");

            var liquidity = await poolInstance._liquidityPool();
            expect(liquidity.toString()).to.eq("20000000000000000000000", "liquidity is valid");

            var totalSizeLong = await poolInstance._totalSizeLong();
            var totalSizeShort = await poolInstance._totalSizeShort();
            var rebaseLong = await poolInstance._rebaseAccumulatedLong();
            var rebaseShort = await poolInstance._rebaseAccumulatedShort();
            expect(totalSizeLong.toString()).to.eq("0", "totalSizeLong is valid");
            expect(totalSizeShort.toString()).to.eq("5000003304785684320", "totalSizeShort is valid");
            expect(rebaseLong.toString()).to.eq("0", "rebaseLong is valid");
            expect(rebaseShort.toString()).to.eq("0", "rebaseShort is valid");

            var balanceOther = await this.usdcInstance.balanceOf(others);
            var balancePool = await this.usdcInstance.balanceOf(poolAddress)
            expect(balanceOther.toString()).to.eq("0", "balanceOther is valid");
            expect(balancePool.toString()).to.eq("21000000000000000000000", "balancePool is valid");
            //设置价格
            const uniPoolInstance = await mockUniswapV3Pool.at(pairAddress);
            await uniPoolInstance.setPriceParam(69180, BigNumber.from("123454651815154565"));//1.0001^69180 = 1009.94799969
            await advanceblock(100);


            await poolInstance.closePosition(1, { from: others });
            var positionInfo = await poolInstance.getPosition(1);
            expect(positionInfo[0].toString()).to.eq("0", "position openPrice is valid");
            expect(positionInfo[1].toString()).to.eq("0", "position margin is valid");
            expect(positionInfo[2].toString()).to.eq("0", "position size is valid");
            expect(positionInfo[3].toString()).to.eq("0", "position rebase is valid");
            expect(positionInfo[4].toString()).to.eq("0x0000000000000000000000000000000000000000", "position owner is valid");
            expect(positionInfo[5].toString()).to.eq("0", "position direction is valid");

            var balanceOther = await this.usdcInstance.balanceOf(others);
            var balancePool = await this.usdcInstance.balanceOf(poolAddress)
            expect(balanceOther.toString()).to.eq("934339577592683444290", "balanceOther is valid");
            expect(balancePool.toString()).to.eq("20065660422407316555710", "balancePool is valid");

            var liquidity = await poolInstance._liquidityPool();
            expect(liquidity.toString()).to.eq("20065660422407316555710", "liquidity is valid");

            var totalSizeLong = await poolInstance._totalSizeLong();
            var totalSizeShort = await poolInstance._totalSizeShort();
            var rebaseLong = await poolInstance._rebaseAccumulatedLong();
            var rebaseShort = await poolInstance._rebaseAccumulatedShort();
            expect(totalSizeLong.toString()).to.eq("0", "totalSizeLong is valid");
            expect(totalSizeShort.toString()).to.eq("0", "totalSizeShort is valid");
            expect(rebaseLong.toString()).to.eq("0", "rebaseLong is valid");
            expect(rebaseShort.toString()).to.eq("1652058474485071", "rebaseShort is valid");
        });

    });
});