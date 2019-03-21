const moment = require('moment');
const Web3 = require('web3');
// Import all required modules from openzeppelin-test-helpers
const {BN, time, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');
// Import preferred chai flavor: both expect and should are supported
const {expect} = require('chai');

const AsureToken = artifacts.require('AsureToken');
const AsureCrowdsale = artifacts.require('AsureCrowdsale');
const AsureCrowdsaleDeployer = artifacts.require('AsureCrowdsaleDeployer');

// let lastSnapshot;
//
// const saveState = async () => {
//   const { result } = await web3.currentProvider.send({
//     jsonrpc: '2.0',
//     method: 'evm_snapshot',
//     id: 0
//   });
//
//   lastSnapshot = parseInt(result, 0);
// };
//
// const revertState = async () => {
//   await web3.currentProvider.send({
//     jsonrpc: '2.0',
//     method: 'evm_revert',
//     params: lastSnapshot,
//     id: 0
//   });
//
//   lastSnapshot = await saveState();
// };

contract('AsureCrowdsaleDeployer', async accounts => {

  // beforeAll(async () => {
  //   await saveState()
  // });
  //
  // afterAll(async() => {
  //   await revertState()
  // });

  const owner = accounts[0];
  const wallet = accounts[0];
  const maxCap = String(100 * 10 ** 6);

  const now = moment();
  const openingTime = now.clone().add(1, 'days');
  const closingTime = openingTime.clone().add(2, 'weeks');

  const openingTimeUnix = openingTime.unix();
  const closingTimeUnix = closingTime.unix();
  let token, presale, mainsale;

  it('should instantiate [AsureToken + PresaleCrowdsale + MainsaleCrowdsale]', async () => {
    const crowdsaleDeployer = await AsureCrowdsaleDeployer.new(owner);

    const mintTx = await crowdsaleDeployer.mint(
      wallet,    // foundationWallet
      wallet,        // bountyWallet
      wallet, // familyFriendsWallet
      [wallet], //team
      [8000000],
      [wallet], //advisors
      [2000000],
      {from: owner}
    );

    const preSaleTx = await crowdsaleDeployer.createPreSale(
      200 * (1 / 0.5),         // initial rate: ETH = 200 USD + 50% bonus
      200 * (1 / 0.5),         // bonus rate: ETH = 200 USD + 50% bonus
      openingTimeUnix,         // bonus time
      owner,
      wallet, // wallet
      openingTimeUnix,         // today
      closingTimeUnix,
      {from: owner}
    );

    const mainSaleTx = await crowdsaleDeployer.createMainSale(
      200 * (1 / 0.5),         // initial rate: ETH = 200 USD + 50% bonus
      200 * (1 / 0.5),         // bonus rate: ETH = 200 USD + 50% bonus
      openingTimeUnix,         // bonus time
      owner,
      wallet,                  // wallet
      openingTimeUnix,         // today
      closingTimeUnix,
      {from: owner}
    );

    const tokenAddress = await crowdsaleDeployer.token.call();
    const presaleAddress = await crowdsaleDeployer.presale.call();
    const mainAddress = await crowdsaleDeployer.mainsale.call();

    token = await AsureToken.at(tokenAddress);
    presale = await AsureCrowdsale.at(presaleAddress);
    mainsale = await AsureCrowdsale.at(mainAddress);

    expect(token).to.be.an.instanceof(AsureToken);
    expect(presale).to.be.an.instanceof(AsureCrowdsale);
    expect(mainsale).to.be.an.instanceof(AsureCrowdsale);
  });

  it('should instantiate AsureToken correctly', async () => {
    const tokenName = await token.name.call();
    const tokenSymbol = await token.symbol.call();
    const tokenDecimals = await token.decimals.call();
    const tokenTotalSupply = await token.totalSupply.call();
    const balanceOfPresale = await token.balanceOf.call(presale.address);
    const balanceOfMainsale = await token.balanceOf.call(mainsale.address);

    expect(tokenName).to.eq('AsureToken');
    expect(tokenSymbol).to.eq('ASR');
    expect(tokenDecimals.toNumber()).to.eq(18);
    expect(Web3.utils.fromWei(tokenTotalSupply)).to.eq(maxCap);
    expect(Web3.utils.fromWei(balanceOfPresale)).to.eq(String(10 * 10 ** 6));
    expect(Web3.utils.fromWei(balanceOfMainsale)).to.eq(String(35 * 10 ** 6));
  });

  it('should instantiate PresaleCrowdsale correctly', async () => {
    const crowdsaleWallet = await presale.wallet.call();
    const crowdsaleInitialRate = await presale.initialRate.call();
    const crowdsaleOpeningTime = await presale.openingTime.call();
    const crowdsaleClosingTime = await presale.closingTime.call();

    expect(crowdsaleWallet).to.eq(wallet);
    expect(crowdsaleInitialRate.toNumber()).to.eq(400);
    expect(crowdsaleOpeningTime.toNumber()).to.eq(openingTimeUnix);
    expect(crowdsaleClosingTime.toNumber()).to.eq(closingTimeUnix);
  });

  it('should instantiate MainsaleCrowdsale correctly', async () => {
    const crowdsaleWallet = await mainsale.wallet.call();
    const crowdsaleInitialRate = await mainsale.initialRate.call();
    const crowdsaleOpeningTime = await mainsale.openingTime.call();
    const crowdsaleClosingTime = await mainsale.closingTime.call();

    expect(crowdsaleWallet).to.eq(wallet);
    expect(crowdsaleInitialRate.toNumber()).to.eq(400);
    expect(crowdsaleOpeningTime.toNumber()).to.eq(openingTimeUnix);
    expect(crowdsaleClosingTime.toNumber()).to.eq(closingTimeUnix);
  });

  it('reverts when transferring to a not whitelisted address address', async function () {
    const beneficiary = accounts[2];
    const ethValue = Web3.utils.toWei('1');

    await time.increase(time.duration.days(5));

    const presaleIsOpen = await presale.isOpen.call();
    expect(presaleIsOpen).to.eq(true);

    // Edge cases that trigger a require statement can be tested for, optionally checking the revert reason as well
    await shouldFail.reverting(
      presale
        .buyTokens
        .sendTransaction(beneficiary, {value: ethValue, from: beneficiary})
    );


  });

  it('should buy Asure tokens for 1 ETH', async () => {
    const beneficiary = accounts[2];
    const ethValue = Web3.utils.toWei('1');

    const presaleIsOpen = await presale.isOpen.call();
    expect(presaleIsOpen).to.eq(true);

    await presale
      .addWhitelisted
      .sendTransaction(beneficiary, {from: owner});

    await presale
      .buyTokens
      .sendTransaction(beneficiary, {value: ethValue, from: beneficiary});

    const presaleWeiRaised = await presale.weiRaised.call();
    expect(Web3.utils.fromWei(presaleWeiRaised)).to.eq('1');

    const beneficiaryBalance = await token.balanceOf.call(beneficiary);
    expect(Web3.utils.fromWei(beneficiaryBalance)).to.eq('400');
  });


  it('should burn Asure tokens after preSale', async () => {

    await time.increase(time.duration.weeks(5));

    const presaleIsOpen = await presale.isOpen.call();
    const presaleHasClosed = await presale.hasClosed.call();
    expect(presaleIsOpen).to.eq(false);
    expect(presaleHasClosed).to.eq(true);

    await presale
      .burn
      .sendTransaction({from: owner});

    const tokenTotalSupply = await token.totalSupply.call();
    expect(Web3.utils.fromWei(tokenTotalSupply)).to.eq(String((100 * 10 ** 6) - (10 * 10 ** 6-400)));

    //const burnBalance = await token.balanceOf.call(constants.ZERO_ADDRESS);
    //expect(Web3.utils.fromWei(burnBalance)).to.eq(String(10 * 10 ** 6-400));
  });


});
