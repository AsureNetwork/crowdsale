const moment = require('moment');
const Web3 = require('web3');
// Import all required modules from openzeppelin-test-helpers
const {BN, time, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');
// Import preferred chai flavor: both expect and should are supported
const {expect} = require('chai');

const AsureToken = artifacts.require('AsureToken');
const AsureCrowdsale = artifacts.require('AsureCrowdsale');

contract('AsureCrowdsale', async accounts => {
  let owner, wallet, maxCap, saleCap, token, singleWhitelistCrowdsale, crowdsale;
  let openingTime, bonusTime, closingTime;
  let initialRate, bonusRate;

  before(async () => {
    owner = accounts[1];
    wallet = accounts[2];
    maxCap = String(100 * 10 ** 6);
    saleCap = String(10 * 10 ** 6);
    const now = moment();
    openingTime = now.clone().add(1, 'days');
    bonusTime = openingTime.clone().add(1, 'weeks');
    closingTime = openingTime.clone().add(2, 'weeks');
    initialRate = 1000;
    bonusRate = 500;
    token = await AsureToken.new(owner,
      "AsureToken",
      "ASR",
      18,
      maxCap,
      {from: owner}
    );

    singleWhitelistCrowdsale = await AsureCrowdsale.new(
      1000,
      bonusTime.unix(),
      500,
      accounts[0],
      wallet,
      token.address,
      openingTime.unix(),
      closingTime.unix()
    );

    crowdsale = await AsureCrowdsale.new(
      1000,
      bonusTime.unix(),
      500,
      owner,
      wallet,
      token.address,
      openingTime.unix(),
      closingTime.unix()
    );

    await token.mint.sendTransaction(crowdsale.address, saleCap, {from: owner});
    await token.mint.sendTransaction(wallet, maxCap - saleCap, {from: owner});
  });

  it('should verify test setup', async () => {
    expect(await crowdsale.openingTime.call()).to.be.bignumber.equal(new BN(openingTime.unix()));
    expect(await crowdsale.closingTime.call()).to.be.bignumber.equal(new BN(closingTime.unix()));
    expect(await crowdsale.token.call()).to.be.equal(token.address);
    expect(await crowdsale.wallet.call()).to.be.equal(wallet);
  });

  describe('constructor', () => {
    // it('should initialize "initialRate", "bonusRate", and "bonusTime"', async () => {
    //   expect(await crowdsale.initialRate()).to.be.bignumber.equal(initialRate);
    //   expect(await crowdsale.bonusRate()).to.be.bignumber.equal(bonusRate);
    //   expect(await crowdsale.bonusTime()).to.be.bignumber.equal(new BN(bonusTime.unix().toString()));
    // });

    it('should add whitelist admins to crowdsale', async () => {
      let isSenderAdminInSingleWhitelist = await singleWhitelistCrowdsale.isWhitelistAdmin(accounts[0]);
      let isOwnerAdminInSingleWhitelist = await singleWhitelistCrowdsale.isWhitelistAdmin(owner);
      expect(isSenderAdminInSingleWhitelist).to.be.equal(true);
      expect(isOwnerAdminInSingleWhitelist).to.be.equal(false);

      let isSenderAdminInCrowdsale = await crowdsale.isWhitelistAdmin(accounts[0]);
      let isOwnerAdminInCrowdsale = await crowdsale.isWhitelistAdmin(owner);
      expect(isSenderAdminInCrowdsale).to.be.equal(true);
      expect(isOwnerAdminInCrowdsale).to.be.equal(true);
    });

    it('should transfer token ownership to new owner', async () => {
      expect(await token.owner()).to.be.equal(owner);
    });

    it('should transfer crowdsale ownership to new owner', async () => {
      expect(await crowdsale.owner()).to.be.equal(owner);
    });
    /*
        it('should initialize "tokenDecimals" and "tokenTotalSupply"', async () => {
          const tokenDecimals = await token.decimals.call();
          const tokenTotalSupply = await token.totalSupply.call();

          expect(tokenDecimals.toNumber()).to.eq(18);
          expect(Web3.utils.toWei(Web3.utils.fromWei(tokenTotalSupply))).to.eq(maxCap);
        });*/


  });

  describe('burn', () => {
    it('should not burn crowdsale unsold tokens within crowdsale', async () => {

      await time.increase(time.duration.days(2));

      const isOpen = await crowdsale.isOpen.call();
      expect(isOpen).to.eq(true);

      await shouldFail.reverting(crowdsale
        .burn
        .sendTransaction({from: owner}));
    });

    xit('should burn after crowdsale unsold tokens', async () => {
      await time.increase(time.duration.weeks(5));
      const isOpen = await crowdsale.isOpen.call();
      const hasClosed = await crowdsale.hasClosed.call();
      expect(isOpen).to.eq(false);
      expect(hasClosed).to.eq(true);

      await crowdsale
        .burn
        .sendTransaction({from: owner});

      const tokenTotalSupply = await token.totalSupply.call();
      expect(Web3.utils.fromWei(tokenTotalSupply)).to.eq(String((100 * 10 ** 6) - (10 * 10 ** 6 - 400)));


    });
  });

  describe('addWhitelistedAccounts', () => {
    it('should add whitelist users', async () => {
      await crowdsale.addWhitelistedAccounts.sendTransaction([
          accounts[1],
          accounts[2],
          accounts[3],
          accounts[4],
          accounts[5]
        ],
        {from: owner}
      );
      expect(await crowdsale.isWhitelisted(accounts[0])).to.eq(false);
      expect(await crowdsale.isWhitelisted(accounts[1])).to.eq(true);
      expect(await crowdsale.isWhitelisted(accounts[2])).to.eq(true);
      expect(await crowdsale.isWhitelisted(accounts[3])).to.eq(true);
      expect(await crowdsale.isWhitelisted(accounts[4])).to.eq(true);
      expect(await crowdsale.isWhitelisted(accounts[5])).to.eq(true);
    });
  });

});
