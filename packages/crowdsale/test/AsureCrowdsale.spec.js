const moment = require('moment');
const Web3 = require('web3');
// Import all required modules from openzeppelin-test-helpers
const {BN, time, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');
// Import preferred chai flavor: both expect and should are supported
const {expect} = require('chai');

const AsureToken = artifacts.require('AsureToken');
const AsureCrowdsale = artifacts.require('AsureCrowdsale');

contract('AsureCrowdsale', async accounts => {
  let owner, wallet, maxCap, saleCap, token, crowdsale;
  let openingTime, bonusTime, closingTime;

  before(async () => {
    owner = accounts[0];
    wallet = accounts[1];
    maxCap = String(100 * 10 ** 6);
    saleCap = String(10 * 10 ** 6);
    const now = moment();
    openingTime = now.clone().add(1, 'days');
    bonusTime = openingTime.clone().add(1, 'weeks');
    closingTime = openingTime.clone().add(2, 'weeks');

    token = await AsureToken.new(owner,
      "AsureToken",
      "ASR",
      18,
      maxCap, {from: owner});

    crowdsale = await AsureCrowdsale.new(
      1000,                     // rate, in Asure Tokens
      500,                // bonusRate, in Asure Tokens
      bonusTime.unix(),                // bonus time in unix epoch seconds
      owner,            // owner
      wallet,  // wallet to send Ether
      token.address,                     // the token
      openingTime.unix(),              // opening time in unix epoch seconds
      closingTime.unix(), {from: owner});

      await token.mint.sendTransaction(crowdsale.address, saleCap, {from: owner});
  });

  it('should verify test setup', async () => {
    expect(await crowdsale.openingTime()).to.be.bignumber.equal(new BN(openingTime.unix()));
    expect(await crowdsale.closingTime()).to.be.bignumber.equal(new BN(closingTime.unix()));
    expect(await crowdsale.token()).to.be.equal(token.address);
    expect(await crowdsale.wallet()).to.be.equal(crowdsaleWallet);
  });

  describe('constructor', () => {
    it('should initialize "initialRate", "bonusRate", and "bonusTime"', async () => {
      expect(await crowdsale.initialRate()).to.be.bignumber.equal(rate);
      expect(await crowdsale.bonusRate()).to.be.bignumber.equal(bonusRate);
      expect(await crowdsale.bonusTime()).to.be.bignumber.equal(new BN(bonusTime.unix().toString()));
    });

    it('should transfer ownership to new owner', async () => {
      expect(await crowdsale.owner()).to.be.equal(owner);
    });

    it('should initialize "tokenDecimals" and "tokenTotalSupply"', async () => {
      const tokenDecimals = await token.decimals.call();
      const tokenTotalSupply = await token.totalSupply.call();

      expect(tokenDecimals.toNumber()).to.eq(18);
      expect(Web3.utils.toWei(Web3.utils.fromWei(tokenTotalSupply))).to.eq(maxCap);
    });

    it('should transfer ownership to new owner', async () => {
      expect(await token.owner()).to.be.equal(owner);
    });
  });

  describe('burn', () => {
    it('should burn after crowdsale unsold tokens', async () => {

    });
  });


});
