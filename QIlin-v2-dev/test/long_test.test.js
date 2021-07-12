
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


describe('long _test  position Basic Test', function () {
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

1、此用例用于Short单个测试，测试设计的内容涉及的功能点有：开仓、价格变化、追加保证金、平仓和Rebase；

2、测试开仓方向为long时，totalSizelong和仓位信息（仓位id,保证金,持仓量，持仓人地址）计算输出是否正确；

3、测试当Uniswap 价格发生变化时，√p和 L是否及时更新输出；

4、测试追加保证金时，仓位信息中的Margin 是否计算正确输出；

5、测试平仓时，多空阈值D>5%且totalSizelong > totalSizeshort时，rebaseAccumulatedLong是否计算正确输出；

6、测试平仓后，liquiditypool、totalSizelong 是否计算正确输出；

7、测试 平仓触发Rebase后，lastRebaseBlock，rebaseAccumulatedLong 是否更新输出；

8、测试的区块高度范围（100-125）
        */
        var pairAddress;//创建交易对
        beforeEach(async function () {
            await this.uniFactoryInstance.createPool(this.QiInstance.address, this.usdcInstance.address, 3000, { from: owner });
            pairAddress = await this.uniFactoryInstance.getPool(this.QiInstance.address, this.usdcInstance.address, 3000);
            const uniPoolInstance = await mockUniswapV3Pool.at(pairAddress);
            //await uniPoolInstance.setPriceParam(69081, BigNumber.from("123454651815154565"));//1.0001^69071 = 999.999339043
            await uniPoolInstance.setPriceParam(76013, BigNumber.from("123454651815154565"));//1.0001^76013 = 2000.03500189
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
            var liquidityAmount = BigNumber.from("10000000000000000000000");//10000

            var marginAmount = BigNumber.from("10000000000000000000000");
            await this.usdcInstance.transfer(others, marginAmount, { from: owner });
            await this.usdcInstance.approve(poolAddress, marginAmount, { from: others });

            await this.usdcInstance.approve(poolAddress, liquidityAmount, { from: owner });
            await  time.advanceBlockTo(99);
            let a=await poolInstance.addLiquidity(liquidityAmount, { from: owner });
            expect(a.receipt.blockNumber.toString()).to.eq("100", "the blockNumber is valid (100)");
            newprice=await poolInstance.getPrice()
            console.log("newprice is ",newprice.toString())
            //console.log("a is ",a)
        });

        //开仓
        beforeEach(async function () {
            var currentBlock = await time.latestBlock()
            console.log("currentBlock is ", currentBlock.toString())
            // var marginAmount = BigNumber.from("10000000000000000000000");
            // await this.usdcInstance.transfer(others, marginAmount, { from: owner });
            // await this.usdcInstance.approve(poolAddress, marginAmount, { from: others });
            var openAmount = BigNumber.from("200000000000000000000");//200
            let openP =await poolInstance.openPositionTest(1, 10, openAmount, { from: others });
            //比较当前区块高度
            expect(openP.receipt.blockNumber.toString()).to.eq("101", "the blockNumber is valid (101)");
            //console.log("openP is ",openP)
            //await poolInstance.addMargin(1, openAmount, { from: others });
        });

        it('check after close position', async function () {
            const uniPoolInstance = await mockUniswapV3Pool.at(pairAddress);
            var positionInfo = await poolInstance.getPosition(1);
            expect(positionInfo[0].toString()).to.eq("20000350018936", "position openPrice is valid");
            expect(positionInfo[1].toString()).to.eq("200000000000000000000", "position margin is valid");
            expect(positionInfo[2].toString()).to.eq("999982499359477778", "position size is valid");
            expect(positionInfo[3].toString()).to.eq("0", "position rebase is valid");
            expect(positionInfo[4].toString()).to.eq(others.toString(), "position owner is valid");
            expect(positionInfo[5].toString()).to.eq("1", "position direction is valid");

            var liquidity = await poolInstance._liquidityPool();
            expect(liquidity.toString()).to.eq("10000000000000000000000", "liquidity is valid");
            await  time.advanceBlockTo(104);//价格变动(设置价格)
            await uniPoolInstance.setPriceParam(76501, BigNumber.from("123454651815154565"));//1.0001^76501 = 2100.05228390
            nowprice_2=await poolInstance.getPrice()
            console.log("nowprice_2 is ",nowprice_2.toString())
            expect(nowprice_2.toString()).to.eq("21000522839033", "position now_Price_2 is valid");

            var totalSizeLong = await poolInstance._totalSizeLong();
            var totalSizeShort = await poolInstance._totalSizeShort();
            var rebaseLong = await poolInstance._rebaseAccumulatedLong();
            var rebaseShort = await poolInstance._rebaseAccumulatedShort();
            expect(totalSizeLong.toString()).to.eq("999982499359477778", "totalSizeLong is valid");
            expect(totalSizeShort.toString()).to.eq("0", "totalSizeShort is valid");
            expect(rebaseLong.toString()).to.eq("0", "rebaseLong is valid");
            expect(rebaseShort.toString()).to.eq("0", "rebaseShort is valid");

            var balanceOther = await this.usdcInstance.balanceOf(others);
            var balancePool = await this.usdcInstance.balanceOf(poolAddress)
            expect(balanceOther.toString()).to.eq("9800000000000000000000", "balanceOther is valid");
            expect(balancePool.toString()).to.eq("10200000000000000000000", "balancePool is valid");
            
            await  time.advanceBlockTo(114);//追加保证金
            var openAmount1 = BigNumber.from("200000000000000000000");//200
            await poolInstance.addMargin(1, openAmount1, { from: others });
            //第二次查询
            var totalSizeLong1 = await poolInstance._totalSizeLong();
            var totalSizeShort1 = await poolInstance._totalSizeShort();
            var rebaseLong1= await poolInstance._rebaseAccumulatedLong();
            var rebaseShort1 = await poolInstance._rebaseAccumulatedShort();
            expect(totalSizeLong1.toString()).to.eq("999982499359477778", "totalSizeLong is valid");
            expect(totalSizeShort1.toString()).to.eq("0", "totalSizeShort is valid");
            expect(rebaseLong1.toString()).to.eq("0", "rebaseLong is valid");
            expect(rebaseShort1.toString()).to.eq("0", "rebaseShort is valid");


            var positionInfo1 = await poolInstance.getPosition(1);
            console.log("second query")
            expect(positionInfo1[0].toString()).to.eq("20000350018936", "position openPrice is valid");
            expect(positionInfo1[1].toString()).to.eq("400000000000000000000", "position margin is valid");
            expect(positionInfo1[2].toString()).to.eq("999982499359477778", "position size is valid");
            expect(positionInfo1[3].toString()).to.eq("0", "position rebase is valid");
            expect(positionInfo1[4].toString()).to.eq(others.toString(), "position owner is valid");
            expect(positionInfo1[5].toString()).to.eq("1", "position direction is valid");


            //第三次设置价格2500
            await  time.advanceBlockTo(117);//价格变动(设置价格)
            await uniPoolInstance.setPriceParam(78244, BigNumber.from("123454651815154565"));//1.0001^78244 = 2499.90698979
           // await advanceblock(100);
           nowprice_3=await poolInstance.getPrice()
           console.log("nowprice_3 is ",nowprice_3.toString())
           expect(nowprice_3.toString()).to.eq("24999069897879", "position now_Price_2 is valid");

           
            console.log("third query")
            var totalSizeLong1 = await poolInstance._totalSizeLong();
            var totalSizeShort1 = await poolInstance._totalSizeShort();
            var rebaseLong1= await poolInstance._rebaseAccumulatedLong();
            var rebaseShort1 = await poolInstance._rebaseAccumulatedShort();
            expect(totalSizeLong1.toString()).to.eq("999982499359477778", "totalSizeLong is valid");
            expect(totalSizeShort1.toString()).to.eq("0", "totalSizeShort is valid");
            expect(rebaseLong1.toString()).to.eq("0", "rebaseLong is valid");
            expect(rebaseShort1.toString()).to.eq("0", "rebaseShort is valid");


            var positionInfo2 = await poolInstance.getPosition(1);
            expect(positionInfo2[0].toString()).to.eq("20000350018936", "position openPrice is valid");
            expect(positionInfo2[1].toString()).to.eq("400000000000000000000", "position margin is valid");
            expect(positionInfo2[2].toString()).to.eq("999982499359477778", "position size is valid");
            expect(positionInfo2[3].toString()).to.eq("0", "position rebase is valid");
            expect(positionInfo2[4].toString()).to.eq(others.toString(), "position owner is valid");
            expect(positionInfo2[5].toString()).to.eq("1", "position direction is valid");
            //平仓
            await  time.advanceBlockTo(124);//价格变动(设置价格)
            let res1 =await poolInstance.closePosition(1, { from: others });
            console.log("closePosition")
           //console.log("res1 is ",res1)
           expect(res1.receipt.blockNumber.toString()).to.eq("125", "the blockNumber is valid (125)");
           //console.log(typeof res1.logs === 'object')
           //console.log(res1.logs[1].args)
           //console.log(res1.logs[1].args.serviceFee.toString())
           //console.log(res1.logs[1].args.fundingFee.toString())
           //console.log(res1.logs[1].args.pnl.toString())
           //比较交易单的　服务费　仓管费和ｐｎｌ
           expectEvent(res1,"ClosePosition",{
            serviceFee:new BN("3749794859721499097"),
            fundingFee:new BN("959934355110877380"),
            pnl:new BN("499863239814332733348"),
           })
            console.log("fourth query")
            var totalSizeLong1 = await poolInstance._totalSizeLong();
            var totalSizeShort1 = await poolInstance._totalSizeShort();
            var rebaseLong1= await poolInstance._rebaseAccumulatedLong();
            var rebaseShort1 = await poolInstance._rebaseAccumulatedShort();
            expect(totalSizeLong1.toString()).to.eq("0", "totalSizeLong is valid");
            expect(totalSizeShort1.toString()).to.eq("0", "totalSizeShort is valid");
            expect(rebaseLong1.toString()).to.eq("383994748121571", "rebaseLong is valid");
            expect(rebaseShort1.toString()).to.eq("0", "rebaseShort is valid");

            var positionInfo3 = await poolInstance.getPosition(1);
            expect(positionInfo3[0].toString()).to.eq("0", "position openPrice is valid");
            expect(positionInfo3[1].toString()).to.eq("0", "position margin is valid");
            expect(positionInfo3[2].toString()).to.eq("0", "position size is valid");
            expect(positionInfo3[3].toString()).to.eq("0", "position rebase is valid");
            expect(positionInfo3[4].toString()).to.eq("0x0000000000000000000000000000000000000000", "position owner is valid");
            expect(positionInfo3[5].toString()).to.eq("0", "position direction is valid");



            var balanceOther = await this.usdcInstance.balanceOf(others);
            var balancePool = await this.usdcInstance.balanceOf(poolAddress)
            expect(balanceOther.toString()).to.eq("10495153510599500356871", "balanceOther is valid");
            expect(balancePool.toString()).to.eq("9504846489400499643129", "balancePool is valid");

            var liquidity = await poolInstance._liquidityPool();
            expect(liquidity.toString()).to.eq("9504846489400499643129", "liquidity is valid");

        });

    });
});