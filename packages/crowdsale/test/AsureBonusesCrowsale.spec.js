const {BN, time, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');
const Web3 = require('web3');
const {expect} = require('chai');
const moment = require('moment');
const {isolateTests, initialBlocktime} = require("../utils/testHelpers");

const TestToken = artifacts.require('TestToken');
const TestAsureBonusesCrowdsale = artifacts.require('TestAsureBonusesCrowdsale');

contract('AsureBonusesCrowdsale', async accounts => {
  let owner, token, crowdsale, defaultRate, wallet, openingTime, closingTime;

  isolateTests(() => {
    before(async () => {
      owner = accounts[1];
      wallet = accounts[2];

      token = await TestToken.new();

      openingTime = initialBlocktime.clone().add(1, 'days');
      closingTime = openingTime.clone().add(2, 'weeks');
      bonusRate = new BN('3');
      bonusTime = openingTime.clone().add(1, 'week');
      defaultRate = new BN('2');

      crowdsale = await TestAsureBonusesCrowdsale.new(
        bonusRate,
        bonusTime.unix(),
        defaultRate,
        owner,
        wallet,
        token.address,
        openingTime.unix(),
        closingTime.unix()
      );
      await token.mint(crowdsale.address, Web3.utils.toWei(new BN('9999')));
    });

    it('should verify test setup', async () => {
      expect(await token.totalSupply()).to.be.bignumber.equal(Web3.utils.toWei(new BN('9999')));
      expect(await crowdsale.openingTime()).to.be.bignumber.equal(new BN(openingTime.unix()));
      expect(await crowdsale.closingTime()).to.be.bignumber.equal(new BN(closingTime.unix()));
      expect(await crowdsale.token()).to.be.equal(token.address);
      expect(await crowdsale.wallet()).to.be.equal(wallet);
    });

    describe('constructor', () => {
      it('should initialize "bonusRate", "bonusTime", and "defaultRate"', async () => {
        expect(await crowdsale.bonusRate()).to.be.bignumber.equal(bonusRate);
        expect(await crowdsale.bonusTime()).to.be.bignumber.equal(new BN(bonusTime.unix().toString()));
        expect(await crowdsale.defaultRate()).to.be.bignumber.equal(defaultRate);
      });

      it('should transfer ownership to new owner', async () => {
        expect(await crowdsale.owner()).to.be.equal(owner);
      });
    });

    describe('rate', () => {
      it('should revert as it is deprecated by "bonusRate" and "defaultRate"', async () => {
        await shouldFail.reverting(crowdsale.rate());
      });
    });

    describe('updateRates', () => {
      let newBonusRate, newBonusTime, newDefaultRate;

      beforeEach(() => {
        newBonusRate = new BN('6');
        newBonusTime = openingTime.clone();
        newDefaultRate = new BN('3');
      });

      it('should only be callable by owner', async () => {
        expect(await crowdsale.isOpen()).to.equal(false);
        expect(await crowdsale.hasClosed()).to.equal(false);

        await shouldFail.reverting(crowdsale.updateRates(newBonusRate, newBonusTime.unix(), newDefaultRate));
      });

      it('should revert if the crowdsale is open', async () => {
        await time.increase(time.duration.days(2));
        expect(await crowdsale.isOpen()).to.equal(true);

        await shouldFail.reverting(crowdsale.updateRates(newBonusRate, newBonusTime.unix(), newDefaultRate, {from: owner}));
      });

      it('should revert if the crowdsale is closed', async () => {
        await time.increase(time.duration.weeks(3));
        expect(await crowdsale.hasClosed()).to.equal(true);

        await shouldFail.reverting(crowdsale.updateRates(newBonusRate, newBonusTime.unix(), newDefaultRate, {from: owner}));
      });

      describe('before crowdsale opened', () => {
        beforeEach(async () => {
          expect(await crowdsale.isOpen()).to.equal(false, "isOpen");
          expect(await crowdsale.hasClosed()).to.equal(false, "hasClosed");
        });

        it('should not allow a bonusRate of zero', async () => {
          newBonusRate = new BN('0');
          await shouldFail.reverting(crowdsale.updateRates(newBonusRate, newBonusTime.unix(), newDefaultRate, {from: owner}));
        });

        it('should not allow a bonusTime smaller than the crowdsale openingTime', async () => {
          newBonusTime = openingTime.clone().subtract(1, 'second');

          await shouldFail.reverting(crowdsale.updateRates(newBonusRate, newBonusTime.unix(), newDefaultRate, {from: owner}));
        });

        it('should not allow a bonusTime equal than the crowdsale closingTime', async () => {
          newBonusTime = closingTime.clone();

          await shouldFail.reverting(crowdsale.updateRates(newBonusRate, newBonusTime.unix(), newDefaultRate, {from: owner}));
        });

        it('should not allow a bonusTime greater than the crowdsale closingTime', async () => {
          newBonusTime = closingTime.clone().add(1, 'second');

          await shouldFail.reverting(crowdsale.updateRates(newBonusRate, newBonusTime.unix(), newDefaultRate, {from: owner}));
        });

        it('should not allow a defaultRate of zero', async () => {
          newDefaultRate = new BN('0');
          await shouldFail.reverting(crowdsale.updateRates(newBonusRate, newBonusTime.unix(), newDefaultRate, {from: owner}));
        });

        it('should update rates and emit the "RatesUpdated" event', async () => {
          const {logs} = await crowdsale.updateRates(newBonusRate, newBonusTime.unix(), newDefaultRate, {from: owner});

          expect(await crowdsale.bonusRate()).to.be.bignumber.equal(newBonusRate);
          expect(await crowdsale.bonusTime()).to.be.bignumber.equal(new BN(newBonusTime.unix()).toString());
          expect(await crowdsale.defaultRate()).to.be.bignumber.equal(newDefaultRate);

          expectEvent.inLogs(logs, 'RatesUpdated', {
            bonusRate: newBonusRate,
            bonusTime: new BN(newBonusTime.unix().toString()),
            defaultRate: newDefaultRate
          });
        });
      });
    });

    describe('getCurrentRate', () => {
      it('should return zero before crowdsale is open', async () => {
        expect(await crowdsale.isOpen()).to.equal(false);
        expect(await crowdsale.hasClosed()).to.equal(false);

        expect(await crowdsale.getCurrentRate()).to.be.bignumber.equal(new BN('0'));
      });

      it('should return zero after crowdsale has closed', async () => {
        await time.increase(time.duration.days(15));

        expect(await crowdsale.isOpen()).to.equal(false);
        expect(await crowdsale.hasClosed()).to.equal(true);

        expect(await crowdsale.getCurrentRate()).to.be.bignumber.equal(new BN('0'));
      });

      it('should return the "bonusRate" if crowdsale is open and current time is equal or before "bonusTime"', async () => {
        await time.increase(time.duration.days(3));
        expect(await crowdsale.isOpen()).to.equal(true);

        expect(await crowdsale.getCurrentRate()).to.be.bignumber.equal(bonusRate);
      });

      it('should return the "defaultRate" if crowdsale is open and current time is after "bonusTime"', async () => {
        await time.increase(time.duration.days(14));
        expect(await crowdsale.isOpen()).to.equal(true);

        expect(await crowdsale.getCurrentRate()).to.be.bignumber.equal(defaultRate);
      });
    });

    describe('buyTokens', () => {
      const beneficiary = accounts[4];
      const value = new BN('1');

      it('should buy with "bonusRate" conditions when called before bonus time', async () => {
        await time.increase(time.duration.days(3));
        expect(await crowdsale.isOpen()).to.equal(true);

        await crowdsale.buyTokens.sendTransaction(beneficiary, {value, from: beneficiary});
        expect(await token.balanceOf(beneficiary)).to.be.bignumber.equal(value.mul(bonusRate));
      });

      it('should buy with "defaultRate" conditions when called after bonus time', async () => {
        await time.increase(time.duration.days(10));
        expect(await crowdsale.isOpen()).to.equal(true);

        await crowdsale.buyTokens.sendTransaction(beneficiary, {value, from: beneficiary});
        expect(await token.balanceOf(beneficiary)).to.be.bignumber.equal(value.mul(defaultRate));
      });
    });
  });
});
