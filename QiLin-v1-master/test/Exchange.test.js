const {
  BN,
  constants,
  expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");
const { ZERO_ADDRESS } = constants;
const { accounts, contract } = require("@openzeppelin/test-environment");
const { expect } = require("chai");

const ethers = require("ethers");
const utils = ethers.utils;
const BigNumber = ethers.BigNumber;

const { deployer } = require("./Exchange.deplay");
const {
  testEnv,
  openPosition,
  initTestDepsForExchange,
} = require("./Exchange.functions");
const { checkOpenPositionThenClose } = require("./Exchange.behavior");
//const { testEnv, openPosition } = require('./Exchange.functions');

describe("Exchange Basic Test", function () {
  this.timeout(1500000);

  const [owner, alice, bob] = accounts;

  beforeEach(async function () {
    deployed = await deployer(owner);
    this.exchange = deployed.exchange;
    this.deps = deployed.deps;
    this.usdt = deployed.deps.USDT;
    this.exchangeRates = deployed.deps.ExchangeRates;
    this.depot = deployed.deps.Depot;
    this.fluidity = deployed.deps.Fluidity;
    this.fundToken = deployed.deps.FundToken;
    this.liquidation = deployed.deps.Liquidation;
    this.testAggregator = deployed.aggregator;


    await this.usdt.mint_(alice, BigNumber.from("1000000000000000000000000"), {
      from: owner,
    });

    await this.usdt.mint_(bob, BigNumber.from("100000000000000000000"), {
      from: owner,
    });
   
    // await this.usdt.mint_(
    //   owner, BigNumber.from('10000000000000000000'), { from: owner });
  });

  it("the deployer is the owner", async function () {
    var ow = await  this.exchange.owner()
    console.log("owner is  ",ow)
    expect(await this.exchange.owner()).to.equal(owner);
  });

  it("fundToken get", async function () {
    expect(await this.exchange.fundToken_()).equal(this.deps.FundToken.address);
  });
  /*
  it("open add and withdraw fundLiquidity ",async function(){
    await  this.fluidity.initialFunding(BigNumber.from("500000000000"), { from: owner })
    await  this.fluidity.closeInitialFunding( { from: owner })
    var  m = await this.usdt.balanceOf(owner);
    console.log("owner1 USDT is ",m.toString(10)) ;
    // await this.testAggregator.setState(
    //   BigNumber.from('100000000'), 0, 0, { from: owner });

    let openAmt = BigNumber.from('6000000000000000000000');
    await this.usdt.approve(this.depot.address, openAmt, { from: owner });
    // await this.usdt.approve(this.fluidity.address, openAmt, { from: owner });
    // await this.usdt.approve(this.usdt.address, openAmt, { from: owner });
    // await this.usdt.approve(this.exchange.address, openAmt, { from: owner });depotAddress
    console.log("fluidity  address ",await this.depot.address) ;
    console.log("fluidity  depotAddress ",await this.fluidity.depotAddress2()) ;
    var allowanceU=await this.usdt.allowance(owner,this.depot.address)
    console.log("allowance  fluidity ",allowanceU.toString(10)) ;
    var  m = await this.fundToken.balanceOf(owner);
    console.log("owner fundToken is ",m.toString(10)) ;
    var m1 =await this.usdt.balanceOf(owner);
    console.log("owner usdt is ",m1.toString(10)) ;
    var addLiquidityFund = BigNumber.from(100000000);
    var n = await this.depot.liquidityPool();
    console.log("LiquidityFund init is (??????????????????)", n.toString(10) );
    var n1 = await this.fundToken.totalSupply();
    console.log("fundToken totalSupply is ", n1.toString(10) );

    //await this.testAggregator
    var n2 = await this.depot.totalValue();
    console.log("depot totalValue is ", n2.toString(10) );
    console.log("add Liquidity 100 Fund ");
    await this.fluidity.fundLiquidity(addLiquidityFund,{from:owner});
    var n = await this.depot.liquidityPool();
    console.log("LiquidityFund  update1 is ", n.toString(10) )
    var deleteLiquidityFund = BigNumber.from(100000000);
    console.log("delete Liquidity 100 Fund ");
    await this.fluidity.withdrawLiquidity(deleteLiquidityFund,{from:owner});
    var n1 = await this.depot.liquidityPool();
    console.log("LiquidityFund update2 is ", n1.toString(10) )
  });
  */

  it("open add  fundLiquidity (?????????)",async function(){
    var pool = await this.depot.liquidityPool();
    console.log("LiquidityPool-1 fund is (?????????????????????)", pool.toString(10) )
    console.log("??????100USDT" )
    await  this.fluidity.initialFunding(BigNumber.from("100000000"), { from: owner })
    var pool2 = await this.depot.liquidityPool();
    console.log("LiquidityPool-2 fund is  (?????????????????????)", pool2.toString(10) )


  })

  it("open withdraw fundLiquidity (??????2)",async function(){
    var pool = await this.depot.liquidityPool();
    console.log("LiquidityPool-1 fund is  (?????????????????????)", pool.toString(10) )
    console.log("??????100USDT" )
    await  this.fluidity.initialFunding(BigNumber.from("100000000"), { from: owner })
    var pool2 = await this.depot.liquidityPool();
    console.log("LiquidityPool-2 fund is  (?????????????????????)", pool2.toString(10) )
    console.log("??????100USDT" )
    await  this.fluidity.withdrawLiquidity(BigNumber.from("100000000"), { from: owner })
    var pool2 = await this.depot.liquidityPool();
    console.log("LiquidityPool-2 fund is  (?????????????????????)", pool2.toString(10) )

  })

  it("open short Position event(??????3??????)", async function (){
    await  this.fluidity.initialFunding(BigNumber.from("500000000000"), { from: owner })
    await  this.fluidity.closeInitialFunding( { from: owner })
    let openAmt = BigNumber.from("100000000000000000000000");
    await this.usdt.approve(this.depot.address, openAmt, { from: alice });
    let openAmt1 = BigNumber.from('6000000000000000000000');
    await this.usdt.approve(this.depot.address, openAmt1, { from: owner });

    await this.testAggregator.setState(BigNumber.from("1900"), 0, 0, {
      from: owner,
    });
    var pool1 = await this.depot.liquidityPool();
    console.log("LiquidityPool-1 fund is ????????????????????????????????????", pool1.toString(10) )
    var netValue2 = await this.depot.netValue(2);
    console.log("netValue-1  is ", netValue2.toString(10) )
    var fundTokenPrice1 = await this.fluidity.fundTokenPrice2();
    console.log("fundTokenPrice1-1 is?????????LP????????? ", fundTokenPrice1.toString(10) );

    let price = (await this.testAggregator.latestAnswer()).toString(10) ;
    console.log("price is (??????????????????)", price)
    console.log("??????(??????)")
    var res = await this.exchange.openPosition(
      deployed.data.currencyKey,
      2,
      10,
      BigNumber.from("10000000000"),//10**4*10**6
      { from: alice }
    );
    //console.log("res is ", res)position
    // var a =await this.exchangeRates.rateForCurrency(0x636b000000000000000000000000000000000000000000000000000000000000);
    // console.log("price ", a)
    console.log("???????????????????????????")
    let positon1 = await this.depot.position(1);
    console.log("positon1 share is ", positon1[1].toString(10))
    console.log("positon1 leveragedPosition is ", positon1[2].toString(10))
    console.log("positon1 openPositionPrice is ", positon1[3].toString(10));
    console.log("positon1 currencyKeyIdx is ", positon1[4].toString(10));
    console.log("positon1 direction is ", positon1[5].toString(10));
    console.log("positon1 margin is ", positon1[6].toString(10));
    console.log("positon1 openRebaseLeft is ", positon1[7].toString(10));
    console.log("????????????is ", (positon1[2]/positon1[3]*1e12).toString(10));
    ccl=positon1[2]/positon1[3]*1e12;
    //console.log("size  is ",positon1[2]/ positon1[3])
    let totalValue1 = await  this.depot.totalValue();
    console.log("totalValue1  is ", totalValue1.toString(10))
    console.log("??????????????????")
    await this.testAggregator.setState(BigNumber.from("1000"), 0, 0, {
      from: owner,
    });
    let price2 = (await this.testAggregator.latestAnswer()).toString(10) ;
    console.log("price2 is (????????????)", price2);
    console.log("PNL is ", (price-price2)*ccl);
    var netValue2 = await this.depot.netValue(2);
    console.log("netValue-1  is ", netValue2.toString(10) )
    console.log("????????????")
    var res2 = await this.exchange.closePosition(1,{from:alice});
    var pool2 = await this.depot.liquidityPool();
    console.log("LiquidityPool-1 fund is (?????????????????????????????????)", pool2.toString(10) )
    var netValue3 = await this.depot.netValue(2);
    console.log("netValue-1  is ", netValue3.toString(10) )
    var n1 = await this.fundToken.totalSupply();
    console.log("fundToken totalSupply is ", n1.toString(10) );
    var fundTokenPrice2 = await this.fluidity.fundTokenPrice2();
    console.log("fundTokenPrice2 is (??????LP??????)", fundTokenPrice2.toString(10) );
    console.log("APY is ", (fundTokenPrice1-fundTokenPrice2)/fundTokenPrice1 );

  })



  it("open short Position event(?????? 4 ??????)", async function (){
    await  this.fluidity.initialFunding(BigNumber.from("500000000000"), { from: owner })
    await  this.fluidity.closeInitialFunding( { from: owner })
    let openAmt = BigNumber.from("100000000000000000000000");
    await this.usdt.approve(this.depot.address, openAmt, { from: alice });
    let openAmt1 = BigNumber.from('6000000000000000000000');
    await this.usdt.approve(this.depot.address, openAmt1, { from: owner });
    console.log("??????????????????1900" )
    await this.testAggregator.setState(BigNumber.from("1900"), 0, 0, {
      from: owner,
    });
    var pool1 = await this.depot.liquidityPool();
    console.log("LiquidityPool-1 fund is ", pool1.toString(10) )
    var netValue2 = await this.depot.netValue(2);
    console.log("netValue-1  is ", netValue2.toString(10) )
    var fundTokenPrice1 = await this.fluidity.fundTokenPrice2();
    console.log("fundTokenPrice1-1 is ", fundTokenPrice1.toString(10) );

    let price = (await this.testAggregator.latestAnswer()).toString(10) ;
    console.log("price is(?????????????????????) ", price)
    console.log("?????????????????? ")
    var res = await this.exchange.openPosition(
      deployed.data.currencyKey,
      2,
      10,
      BigNumber.from("10000000000"),//10**4*10**6
      { from: alice }
    );
    //console.log("res is ", res)position
    // var a =await this.exchangeRates.rateForCurrency(0x636b000000000000000000000000000000000000000000000000000000000000);
    // console.log("price ", a)
    let positon1 = await this.depot.position(1);
    console.log("positon1 share is ", positon1[1].toString(10))
    console.log("positon1 leveragedPosition is ", positon1[2].toString(10))
    console.log("positon1 openPositionPrice is ", positon1[3].toString(10))
    console.log("positon1 currencyKeyIdx is ", positon1[4].toString(10))
    console.log("positon1 direction is ", positon1[5].toString(10))
    console.log("positon1 margin is ", positon1[6].toString(10))
    console.log("positon1 openRebaseLeft is ", positon1[7].toString(10))
    console.log("????????????is ", (positon1[2]/positon1[3]*1e12).toString(10));
    ccl=positon1[2]/positon1[3]*1e12;
    //console.log("size  is ",positon1[2]/ positon1[3])
    let totalValue1 = await  this.depot.totalValue();
    console.log("totalValue1  is ", totalValue1.toString(10))
    console.log("??????????????????2050")
    await this.testAggregator.setState(BigNumber.from("2050"), 0, 0, {
      from: owner,
    });
    let price2 = (await this.testAggregator.latestAnswer()).toString(10) ;
    console.log("price2 is (????????????)", price2);
    var netValue2 = await this.depot.netValue(2);
    console.log("netValue-1  is ", netValue2.toString(10) )
    console.log("??????" )
    var res2 = await this.exchange.closePosition(1,{from:alice});
    var pool2 = await this.depot.liquidityPool();
    console.log("LiquidityPool-1 fund is (???????????????)", pool2.toString(10) )
    var netValue3 = await this.depot.netValue(2);
    console.log("netValue-1  is ", netValue3.toString(10) )
    var n1 = await this.fundToken.totalSupply();
    console.log("fundToken totalSupply is ", n1.toString(10) );
    var fundTokenPrice2 = await this.fluidity.fundTokenPrice2();
    console.log("fundTokenPrice2 is ", fundTokenPrice2.toString(10) );
    console.log("APY is ", (fundTokenPrice1-fundTokenPrice2)/fundTokenPrice1 );

  })

  it("open  event(?????? 5 ?????????)", async function (){
    await  this.fluidity.initialFunding(BigNumber.from("500000000000"), { from: owner })
    await  this.fluidity.closeInitialFunding( { from: owner })
    let openAmt = BigNumber.from("100000000000000000000000");
    await this.usdt.approve(this.depot.address, openAmt, { from: alice });
    let openAmt1 = BigNumber.from('6000000000000000000000');
    await this.usdt.approve(this.depot.address, openAmt1, { from: owner });
    var availableToFund = await this.fluidity.availableToFund();
    console.log("availableToFund is ????????????????????????", availableToFund.toString(10) );
    await this.testAggregator.setState(BigNumber.from("1000"), 0, 0, {
      from: owner,
    });
    let price = (await this.testAggregator.latestAnswer()).toString(10) ;
    console.log("price is ", price)
    console.log("????????????????????????10????????????10000")
    var res = await this.exchange.openPosition(
      deployed.data.currencyKey,
      2,
      10,
      BigNumber.from("100000000000"),//10**4*10**6
      { from: alice }
    );
    var availableToFund2 = await this.fluidity.availableToFund_test();
    console.log("availableToFund_test is ", availableToFund2.toString(10) );
    var availableToFund3 = await this.fluidity.availableToFund();
    console.log("availableToFund3 is ", availableToFund3.toString(10) );


  })



});

describe("Exchange v1-Trade Test", function () {
  this.timeout(3000000);

  const [owner, alice, bob] = accounts;

  beforeEach(async function () {
    deployed = await deployer(owner);
    this.exchange = deployed.exchange;
    this.deps = deployed.deps;
    this.usdt = deployed.deps.USDT;
    this.exchangeRates = deployed.deps.ExchangeRates;
    this.depot = deployed.deps.Depot;
    this.fluidity = deployed.deps.Fluidity;
    this.fundToken = deployed.deps.FundToken;
    this.testAggregator = deployed.aggregator;
    this.systemSetting = deployed.deps.SystemSetting;
    this.liquidation = deployed.deps.Liquidation;


    await this.usdt.mint_(alice, BigNumber.from("1000000000000000000000000"), {
      from: owner,
    });

    await this.usdt.mint_(bob, BigNumber.from("10000000000000000000000"), {
      from: owner,
    });
    let openAmt = BigNumber.from("100000000000000000000000");
    await this.usdt.approve(this.depot.address, openAmt, { from: alice });
    let openAmt1 = BigNumber.from('6000000000000000000000');
    await this.usdt.approve(this.depot.address, openAmt1, { from: owner });
    let openAmt2 = BigNumber.from('6000000000000000000000');
    await this.usdt.approve(this.depot.address, openAmt2, { from: bob });
    
    await this.systemSetting.setPositionClosingFee(BigNumber.from("1500000000000000"), { from: owner }); // 0.15%  Decimal 18
    await this.systemSetting.setLiquidationFee(BigNumber.from("20000000000000000"), { from: owner }); // 2.0%  Decimal 18
    await  this.fluidity.initialFunding(BigNumber.from("500000000000"), { from: owner })
    await  this.fluidity.closeInitialFunding( { from: owner })

    
    await this.testAggregator.setState(BigNumber.from("1900"), 0, 0, {
      from: owner,
    });
    var res1 = await this.exchange.openPosition(
      deployed.data.currencyKey,
      1,
      2,
      BigNumber.from("200000000"),//10**4*10**6
      { from: alice }
    );

    var res2 = await this.exchange.openPosition(
      deployed.data.currencyKey,
      2,
      10,
      BigNumber.from("200000000"),//10**4*10**6
      { from: bob }
    );
    await this.testAggregator.setState(BigNumber.from("2100"), 0, 0, {
      from: owner,
    });
    var res3 = await this.exchange.openPosition(
      deployed.data.currencyKey,
      1,
      2,
      BigNumber.from("200000000"),//10**4*10**6
      { from: alice }
    );
    await this.testAggregator.setState(BigNumber.from("1000"), 0, 0, {
      from: owner,
    });
    var res4 = await this.exchange.openPosition(
      deployed.data.currencyKey,
      2,
      10,
      BigNumber.from("200000000"),//10**4*10**6
      { from: bob }
    );

  });



    it("open  event(????????????????????????)", async function (){
      await this.testAggregator.setState(BigNumber.from("1910"), 0, 0, {
        from: owner,
      });
      console.log("?????????1 ????????????")
      let positon1 = await this.depot.position(1);
      console.log("positon1 account is ", positon1[0].toString(10))
      console.log("positon1 share is ", positon1[1].toString(10))
      console.log("positon1 leveragedPosition is ", positon1[2].toString(10))
      console.log("positon1 openPositionPrice is ", positon1[3].toString(10))
      console.log("positon1 currencyKeyIdx is ", positon1[4].toString(10))
      console.log("positon1 direction is ", positon1[5].toString(10))
      console.log("positon1 margin is ", positon1[6].toString(10))
      console.log("positon1 openRebaseLeft is ", positon1[7].toString(10))
      console.log("??????1????????????")
      let positonstate1 = await this.depot.positionState(
        deployed.data.currencyKey,1
        );
      console.log("positonstate1 account is ", positonstate1[0].toString(10))
      console.log("positonstate1 pSize (?????????)is ", positonstate1[1].toString(10))
      console.log("positonstate1 pValue(????????????) is ", positonstate1[2].toString(10))
      console.log("positonstate1 forceLiquidation(?????????) is ", positonstate1[3].toString(10))
      console.log("positonstate1 PnL is ", positonstate1[4].toString(10))
    
    await this.testAggregator.setState(BigNumber.from("1500"), 0, 0, {
      from: owner,
    });

    let positon2 = await this.depot.position(2);
    console.log("positon2 account is ", positon2[0].toString(10))
    console.log("positon2 share is ", positon2[1].toString(10))
    console.log("positon2 leveragedPosition is ", positon2[2].toString(10))
    console.log("positon2 openPositionPrice is ", positon2[3].toString(10))
    console.log("positon2 currencyKeyIdx is ", positon2[4].toString(10))
    console.log("positon2 direction is ", positon2[5].toString(10))
    console.log("positon2 margin is ", positon2[6].toString(10))
    console.log("positon2 openRebaseLeft is ", positon2[7].toString(10))
    console.log("??????2????????????")
    let positonstate2 = await this.depot.positionState(
      deployed.data.currencyKey,2
      );
    console.log("positonstate2 account is ", positonstate2[0].toString(10))
    console.log("positonstate2 pSize (?????????)is ", positonstate2[1].toString(10))
    console.log("positonstate2 pValue(????????????) is ", positonstate2[2].toString(10))
    console.log("positonstate2 forceLiquidation(?????????) is ", positonstate2[3].toString(10))
    console.log("positonstate2 PnL is ", positonstate2[4].toString(10))
    console.log("??????3????????????")
    let positonstate3 = await this.depot.positionState(
      deployed.data.currencyKey,3
      );
    console.log("positonstate3 account is ", positonstate3[0].toString(10))
    console.log("positonstate3 pSize (?????????)is ", positonstate3[1].toString(10))
    console.log("positonstate3 pValue(????????????) is ", positonstate3[2].toString(10))
    console.log("positonstate3 forceLiquidation(?????????) is ", positonstate3[3].toString(10))
    console.log("positonstate3 PnL is ", positonstate3[4].toString(10))
    console.log("?????????????????????")
    let positonstate4 = await this.depot.positionState(
      deployed.data.currencyKey,4
      );
    console.log("positonstate4 account is ", positonstate4[0].toString(10))
    console.log("positonstate4 pSize (?????????)is ", positonstate4[1].toString(10))
    console.log("positonstate4 pValue(????????????) is ", positonstate4[2].toString(10))
    console.log("positonstate4 forceLiquidation(?????????) is ", positonstate4[3].toString(10))
    console.log("positonstate4 PnL is ", positonstate4[4].toString(10))


  })
    it("open  event(??????2??????????????????)", async function (){
      await this.testAggregator.setState(BigNumber.from("1910"), 0, 0, {
        from: owner,
      });
      let positon1 = await this.depot.position(1);
      console.log("positon1 account is ", positon1[0].toString(10))
      console.log("positon1 share is ", positon1[1].toString(10))
      console.log("positon1 leveragedPosition is ", positon1[2].toString(10))
      console.log("positon1 openPositionPrice is ", positon1[3].toString(10))
      console.log("positon1 currencyKeyIdx is ", positon1[4].toString(10))
      console.log("positon1 direction is ", positon1[5].toString(10))
      console.log("positon1 margin is ", positon1[6].toString(10))
      console.log("positon1 openRebaseLeft is ", positon1[7].toString(10))
      console.log("??????1????????????????????????")
      let addDeposit1 =await this.exchange.addDeposit(1,200000000,{from:alice})
     
      let positon1_1 = await this.depot.position(1);
      console.log("positon1_1 account is ", positon1_1[0].toString(10))
      console.log("positon1_1 share is ", positon1_1[1].toString(10))
      console.log("positon1_1 leveragedPosition is ", positon1_1[2].toString(10))
      console.log("positon1_1 openPositionPrice is ", positon1_1[3].toString(10))
      console.log("positon1_1 currencyKeyIdx is ", positon1_1[4].toString(10))
      console.log("positon1_1 direction is ", positon1_1[5].toString(10))
      console.log("positon1_1 margin is ", positon1_1[6].toString(10))
      console.log("positon1_1 openRebaseLeft is ", positon1_1[7].toString(10))
      let positonstate1_1  = await this.depot.positionState(
        deployed.data.currencyKey,1
        );
      console.log("positonstate1_1 account is ", positonstate1_1[0].toString(10))
      console.log("positonstate1_1 pSize (?????????)is ", positonstate1_1[1].toString(10))
      console.log("positonstate1_1 pValue(????????????) is ", positonstate1_1[2].toString(10))
      console.log("positonstate1_1 forceLiquidation(?????????) is ", positonstate1_1[3].toString(10))
      console.log("positonstate1_1 PnL is ", positonstate1_1[4].toString(10))
      console.log("?????????????????????????????????")
       let addDeposit2 =await this.exchange.addDeposit(2,200000000,{from:bob})
      let positonstate2 = await this.depot.positionState(
        deployed.data.currencyKey,2
        );
      console.log("positonstate2 account is ", positonstate2[0].toString(10))
      console.log("positonstate2 pSize (?????????)is ", positonstate2[1].toString(10))
      console.log("positonstate2 pValue(????????????) is ", positonstate2[2].toString(10))
      console.log("positonstate2 forceLiquidation(?????????) is ", positonstate2[3].toString(10))
      console.log("positonstate2 PnL is ", positonstate2[4].toString(10))
      console.log("??????3????????????????????????")
       let addDeposit3 =await this.exchange.addDeposit(3,200000000,{from:alice})
      let positonstate3 = await this.depot.positionState(
        deployed.data.currencyKey,3
        );
      console.log("positonstate3 account is ", positonstate3[0].toString(10))
      console.log("positonstate3 pSize (?????????)is ", positonstate3[1].toString(10))
      console.log("positonstate3 pValue(????????????) is ", positonstate3[2].toString(10))
      console.log("positonstate3 forceLiquidation(?????????) is ", positonstate3[3].toString(10))
      console.log("positonstate3 PnL is ", positonstate3[4].toString(10))

     })
  
  it("open  event(??????3????????????????????????)", async function (){
    await this.testAggregator.setState(BigNumber.from("2000"), 0, 0, {
      from: owner,
    });
    console.log("??????1??????")
    let positonstate1 = await this.depot.positionState(
      deployed.data.currencyKey,1
      );
    console.log("positonstate1 account is ", positonstate1[0].toString(10))
    console.log("positonstate1 pSize (?????????)is ", positonstate1[1].toString(10))
    console.log("positonstate1 pValue(????????????) is ", positonstate1[2].toString(10))
    console.log("positonstate1 forceLiquidation(?????????) is ", positonstate1[3].toString(10))
    console.log("positonstate1 PnL is ", positonstate1[4].toString(10))
    var res1 = await this.exchange.closePosition(1,{from:alice});
    console.log("res1 state is ",res1)

    await this.testAggregator.setState(BigNumber.from("1140"), 0, 0, {
      from: owner,
    });
    console.log("??????2??????")
    let positonstate2 = await this.depot.positionState(
      deployed.data.currencyKey,2
      );
    console.log("positonstate2 account is ", positonstate2[0].toString(10))
    console.log("positonstate2 pSize (?????????)is ", positonstate2[1].toString(10))
    console.log("positonstate2 pValue(????????????) is ", positonstate2[2].toString(10))
    console.log("positonstate2 forceLiquidation(?????????) is ", positonstate2[3].toString(10))
    console.log("positonstate2 PnL is ", positonstate2[4].toString(10))
    var res2 = await this.exchange.closePosition(2,{from:bob});

    await this.testAggregator.setState(BigNumber.from("2000"), 0, 0, {
      from: owner,
    });
    console.log("??????3 ??????")
    let positonstate3 = await this.depot.positionState(
      deployed.data.currencyKey,3
      );
    console.log("positonstate3 account is ", positonstate3[0].toString(10))
    console.log("positonstate3 pSize (?????????)is ", positonstate3[1].toString(10))
    console.log("positonstate3 pValue(????????????) is ", positonstate3[2].toString(10))
    console.log("positonstate3 forceLiquidation(?????????) is ", positonstate3[3].toString(10))
    console.log("positonstate3 PnL is ", positonstate3[4].toString(10))
    var res3 = await this.exchange.closePosition(3,{from:alice});
    await this.testAggregator.setState(BigNumber.from("1140"), 0, 0, {
      from: owner,
    });
    console.log("??????4 ??????")
    let positonstate4 = await this.depot.positionState(
      deployed.data.currencyKey,4
      );
    console.log("positonstate4 account is ", positonstate4[0].toString(10))
    console.log("positonstate4 pSize (?????????)is ", positonstate4[1].toString(10))
    console.log("positonstate4 pValue(????????????) is ", positonstate4[2].toString(10))
    console.log("positonstate4 forceLiquidation(?????????) is ", positonstate4[3].toString(10))
    console.log("positonstate4 PnL is ", positonstate4[4].toString(10))
    var res4 = await this.exchange.closePosition(4,{from:bob});


  })
  
  it("open  event(??????4?????????????????????)", async function (){
    await this.testAggregator.setState(BigNumber.from("1140"), 0, 0, {
      from: owner,
    });
    console.log("??????1??????")
    let positonstate1 = await this.depot.positionState(
      deployed.data.currencyKey,1
      );
    console.log("positonstate1 account is ", positonstate1[0].toString(10))
    console.log("positonstate1 pSize (?????????)is ", positonstate1[1].toString(10))
    console.log("positonstate1 pValue(????????????) is ", positonstate1[2].toString(10))
    console.log("positonstate1 forceLiquidation(?????????) is ", positonstate1[3].toString(10))
    console.log("positonstate1 PnL is ", positonstate1[4].toString(10))
    var res1 = await this.liquidation.liquidate(1,{from:alice});
    console.log("??????  ",res1)
    await this.testAggregator.setState(BigNumber.from("2052"), 0, 0, {
      from: owner,
    });
    console.log("??????2??????")
    let positonstate2 = await this.depot.positionState(
      deployed.data.currencyKey,2
      );
    console.log("positonstate2 account is ", positonstate2[0].toString(10))
    console.log("positonstate2 pSize (?????????)is ", positonstate2[1].toString(10))
    console.log("positonstate2 pValue(????????????) is ", positonstate2[2].toString(10))
    console.log("positonstate2 forceLiquidation(?????????) is ", positonstate2[3].toString(10))
    console.log("positonstate2 PnL is ", positonstate2[4].toString(10))
    var res2 = await this.liquidation.liquidate(2,{from:bob});
  })
it("open  event(??????5?????????????????????)", async function (){
  await this.testAggregator.setState(BigNumber.from("900"), 0, 0, {
    from: owner,
  });
  console.log("??????1????????????")
    let positonstate1 = await this.depot.positionState(
      deployed.data.currencyKey,1
      );
    console.log("positonstate1 account is ", positonstate1[0].toString(10))
    console.log("positonstate1 pSize (?????????)is ", positonstate1[1].toString(10))
    console.log("positonstate1 pValue(????????????) is ", positonstate1[2].toString(10))
    console.log("positonstate1 forceLiquidation(?????????) is ", positonstate1[3].toString(10))
    console.log("positonstate1 PnL is ", positonstate1[4].toString(10))
    var res1 = await this.liquidation.bankruptedLiquidate(1,{from:bob});

    await this.testAggregator.setState(BigNumber.from("2100"), 0, 0, {
      from: owner,
    });
    console.log("??????2????????????")
    let positonstate2 = await this.depot.positionState(
      deployed.data.currencyKey,2
      );
    console.log("positonstate2 account is ", positonstate2[0].toString(10))
    console.log("positonstate2 pSize (?????????)is ", positonstate2[1].toString(10))
    console.log("positonstate2 pValue(????????????) is ", positonstate2[2].toString(10))
    console.log("positonstate2 forceLiquidation(?????????) is ", positonstate2[3].toString(10))
    console.log("positonstate2 PnL is ", positonstate2[4].toString(10))
    var res2 = await this.liquidation.bankruptedLiquidate(2,{from:alice});
})

    });




