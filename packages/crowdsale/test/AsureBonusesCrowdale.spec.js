const {BN, time, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');
const Web3 = require('web3');
const {expect} = require('chai');
const moment = require('moment');
const {isolateTests} = require("../utils/testHelpers");

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
    bonusRate = new BN('3');
    bonusTime = openingTime.clone();

    if (Number((await time.latest()).toString()) >= openingTime.unix()) {
      console.error('===================================');
      console.error('** it is time to restart ganache **');
      console.error('===================================');
      process.exit(1);
    }

    crowdsale = await TestAsureBonusesCrowdsale.new(
      rate,
      bonusRate,
      bonusTime.unix(),
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

  describe('constructor', () => {
    it('should initialize "initialRate", "bonusRate", and "bonusTime"', async () => {
      expect(await crowdsale.initialRate()).to.be.bignumber.equal(rate);
      expect(await crowdsale.bonusRate()).to.be.bignumber.equal(bonusRate);
      expect(await crowdsale.bonusTime()).to.be.bignumber.equal(new BN(bonusTime.unix().toString()));
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
    let newInitialRate, newBonusRate, newBonusTime;

    beforeEach(() => {
      newInitialRate = new BN('3');
      newBonusRate = new BN('6');
      newBonusTime = openingTime.clone();
    });

    it('should only be callable by owner', async () => {
      expect(await crowdsale.isOpen()).to.equal(false);
      expect(await crowdsale.hasClosed()).to.equal(false);

      await shouldFail.reverting(crowdsale.updateRates(newInitialRate, newBonusRate, newBonusTime.unix()));
    });

    isolateTests(() => {
      it('should revert if the crowdsale is open', async () => {
        await time.increase(time.duration.days(2));
        expect(await crowdsale.isOpen()).to.equal(true);

        await shouldFail.reverting(crowdsale.updateRates(newInitialRate, newBonusRate, newBonusTime.unix(), {from: owner}));
      });

      it('should revert if the crowdsale is closed', async () => {
        await time.increase(time.duration.weeks(3));
        expect(await crowdsale.hasClosed()).to.equal(true);

        await shouldFail.reverting(crowdsale.updateRates(newInitialRate, newBonusRate, newBonusTime.unix(), {from: owner}));
      });
    });

    describe('before crowdsale opened', () => {
      beforeEach(async () => {
        expect(await crowdsale.isOpen()).to.equal(false, "isOpen");
        expect(await crowdsale.hasClosed()).to.equal(false, "hasClosed");
      });

      it('should not allow an initialRate of smaller or equal zero', async () => {
        newInitialRate = new BN('0');

        await shouldFail.reverting(crowdsale.updateRates(newInitialRate, newBonusRate, newBonusTime.unix(), {from: owner}));
      });

      it('should not allow a bonusRate of smaller or equal zero', async () => {
        newBonusRate = new BN('0');

        await shouldFail.reverting(crowdsale.updateRates(newInitialRate, newBonusRate, newBonusTime.unix(), {from: owner}));
      });

      it('should not allow a bonusTime smaller than the crowdsale openingTime', async () => {
        newBonusTime = openingTime.clone().subtract(1, 'second');

        await shouldFail.reverting(crowdsale.updateRates(newInitialRate, newBonusRate, newBonusTime.unix(), {from: owner}));
      });

      it('should update rates and emit the "RatesUpdated" event', async () => {
        const {logs} = await crowdsale.updateRates(newInitialRate, newBonusRate, newBonusTime.unix(), {from: owner});

        expect(await crowdsale.initialRate()).to.be.bignumber.equal(newInitialRate);
        expect(await crowdsale.bonusRate()).to.be.bignumber.equal(newBonusRate);
        expect(await crowdsale.bonusTime()).to.be.bignumber.equal(new BN(newBonusTime.unix()).toString());

        expectEvent.inLogs(logs, 'RatesUpdated', {
          initialRate: newInitialRate,
          bonusRate: newBonusRate,
          bonusTime: new BN(newBonusTime.unix().toString())
        });
      });
    });
  });

  describe('getCurrentRate', () => {
    it('should return zero if crowdsale is not open', async () => {
      expect(await crowdsale.getCurrentRate()).to.be.bignumber.equal(new BN('0'));
    });

    xit('with no "bonusRate" / "bonusTime" should return the initialRate', async () => {
      expect(await crowdsale.getCurrentRate()).to.be.bignumber.equal(rate);
    });
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
