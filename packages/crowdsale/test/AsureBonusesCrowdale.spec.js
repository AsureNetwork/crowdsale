const {BN, time, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers')
const Web3 = require('web3');
const {expect} = require('chai');
const moment = require('moment');

const TestToken = artifacts.require('TestToken');
const TestAsureBonusesCrowdsale = artifacts.require('TestAsureBonusesCrowdsale');

contract('AsureBonusesCrowdsale', async accounts => {
  let owner, token, crowdsale, rate, crowdsaleWallet, openingTime, closingTime;

  before(async () => {
    owner = accounts[1];
    crowdsaleWallet = accounts[2];

    token = await TestToken.new();
    await token.mint(owner, Web3.utils.toWei(new BN('9999')));

    const now = moment();
    openingTime = now.clone().add(1, 'days');
    closingTime = openingTime.clone().add(2, 'weeks');
    rate = new BN('2');

    if (Number((await time.latest()).toString()) >= openingTime.unix()) {
      console.error('===================================');
      console.error('** it is time to restart ganache **');
      console.error('===================================');
      process.exit(1);
    }

    crowdsale = await TestAsureBonusesCrowdsale.new(
      rate,
      owner,
      crowdsaleWallet,
      token.address,
      openingTime.unix(),
      closingTime.unix()
    );
  });

  it('should verify test setup', async () => {
    expect(await token.totalSupply()).to.be.bignumber.equal(Web3.utils.toWei(new BN('9999')));
    expect(await crowdsale.openingTime()).to.be.bignumber.equal(new BN(openingTime.unix()));
    expect(await crowdsale.closingTime()).to.be.bignumber.equal(new BN(closingTime.unix()));
    expect(await crowdsale.token()).to.be.equal(token.address);
    expect(await crowdsale.wallet()).to.be.equal(crowdsaleWallet);
  });

  describe('construtor', () => {
    it('should initialize "initialRate" and "nextBonusRate"', async () => {
      expect(await crowdsale.initialRate()).to.be.bignumber.equal(rate);
      expect(await crowdsale.nextBonusRate()).to.be.bignumber.equal(rate);
    });

    it('should transfer ownership to new owner', async () => {
      expect(await crowdsale.owner()).to.be.equal(owner);
    });
  });

  describe('rate', () => {
    it('should revert as it is deprecated through "initialRate" and "initialRate"', async () => {
      await shouldFail.reverting(crowdsale.rate());
    });
  });

  describe('updateRates', () => {
    let newInitialRate, newBonusRate, newBonusTimeslot;

    beforeEach(() => {
      newInitialRate = new BN('3');
      newBonusRate = new BN('6');
      newBonusTimeslot = new BN('7');
    });

    it('should not allow an initialRate of smaller or equal zero', async () => {
      newInitialRate = new BN('0');

      expect(await crowdsale.isOpen()).to.equal(false);
      expect(await crowdsale.hasClosed()).to.equal(false);

      await shouldFail.reverting(crowdsale.updateRates(newInitialRate, newBonusRate, newBonusTimeslot));
    });

    it('should not allow a bonusRate of smaller or equal zero', async () => {
      newBonusRate = new BN('0');

      expect(await crowdsale.isOpen()).to.equal(false);
      expect(await crowdsale.hasClosed()).to.equal(false);

      await shouldFail.reverting(crowdsale.updateRates(newInitialRate, newBonusRate, newBonusTimeslot));
    });

    it('should only be allowed by owner', async () => {
      expect(await crowdsale.isOpen()).to.equal(false);
      expect(await crowdsale.hasClosed()).to.equal(false);

      await shouldFail.reverting(crowdsale.updateRates(newInitialRate, newBonusRate, newBonusTimeslot));
    });

    it('should update rates and emit the "RatesUpdated" event', async () => {
      expect(await crowdsale.isOpen()).to.equal(false);
      expect(await crowdsale.hasClosed()).to.equal(false);

      const { logs } = await crowdsale.updateRates(newInitialRate, newBonusRate, newBonusTimeslot, { from: owner });

      expect(await crowdsale.initialRate()).to.be.bignumber.equal(newInitialRate);
      expect(await crowdsale.nextBonusRate()).to.be.bignumber.equal(newBonusRate);
      expect(await crowdsale.nextBonusTimeslot()).to.be.bignumber.equal(newBonusTimeslot);

      expectEvent.inLogs(logs, 'RatesUpdated', {
        initialRate: newInitialRate,
        nextBonusRate: newBonusRate,
        nextBonusTimeslot: newBonusTimeslot
      });
    });

    it('should revert if the crowdsale is open', async () => {
      await time.increase(time.duration.days(2));
      expect(await crowdsale.isOpen()).to.equal(true);

      await shouldFail.reverting(crowdsale.updateRates(newInitialRate, newBonusRate, newBonusTimeslot));
    });

    it('should revert if the crowdsale is closed', async () => {
      await time.increase(time.duration.weeks(3));
      expect(await crowdsale.hasClosed()).to.equal(true);

      await shouldFail.reverting(crowdsale.updateRates(newInitialRate, newBonusRate, newBonusTimeslot));
    });
  });

  describe('getCurrentRate', () => {
    // TODO add test describing getCurrentRate
  });

  describe('_getTokenAmount', () => {
    // TODO add test describing _getTokenAmount by testing buyTokens
  });

  describe('initialRate', () => {
    it('should revert as it is deprecated through "initialRate" and "initialRate"', async () => {
      await shouldFail.reverting(crowdsale.rate());
    });
  });

  describe('crowdsale before it is open', () => {
    it('should verify test setup', async () => {
      expect(await token.totalSupply()).to.be.bignumber.equal(Web3.utils.toWei(new BN('9999')));
    });
  });
});
