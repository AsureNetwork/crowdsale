const {BN, time, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');
const moment = require('moment');
const Web3 = require('web3');
const {expect} = require('chai');
const chai = require('chai');
chai.use(require('chai-string'));
const {loadCrowdsaleConfig} = require("../utils/migrations");

const AsureToken = artifacts.require('AsureToken');
const AsureCrowdsale = artifacts.require('AsureCrowdsale');
const TokenVesting = artifacts.require('TokenVesting');

/*
 * XXX The selected network is not available in tests so get it from the commandline if possible.
 * This makes the integration tests work in "development" and "coverage" networks.
 */
let network = 'development';
if (process.argv.includes('--network')) {
  const idx = process.argv.indexOf('--network');
  network = process.argv[idx + 1];
}
const config = loadCrowdsaleConfig(null, network);

contract('Integration', async accounts => {
  let token;

  before(async () => {
    token = await AsureToken.at(config.token.addr);
  });

  describe('Initial ASR token distribution', () => {
    it('should have minted all tokens', async () => {
      expect(await token.totalSupply.call()).to.be.bignumber.equal(await token.cap.call());
    });

    it('should have minted tokens for the foundation', async () => {
      expect(await token.balanceOf.call(config.foundationWallet)).to.be.bignumber.equal(
        Web3.utils.toWei(new BN('35000000'))
      );
    });

    it('should have minted tokens for the bounty contract', async () => {
      expect(await token.balanceOf.call(config.bountyAddr)).to.be.bignumber.equal(
        Web3.utils.toWei(new BN('5000000'))
      );
    });

    it('should have minted tokens for family & friends', async () => {
      expect(await token.balanceOf.call(config.familyFriendsWallet)).to.be.bignumber.equal(
        Web3.utils.toWei(new BN('5000000'))
      );
    });

    const testTokenVestingContract = (kind, member) => {
      it(`should have minted and locked tokens for ${kind} with owner addr ${member.owner}`, async () => {
        const tokenVesting = await TokenVesting.at(member.addr);

        expect(await tokenVesting.beneficiary.call()).to.equalIgnoreCase(member.owner);
        expect(await tokenVesting.start.call()).to.be.bignumber.equal(
          new BN(String(moment(config.mainSale.opening, config.dateFormat).unix()))
        );
        expect(await tokenVesting.cliff.call()).to.be.bignumber.equal(
          new BN(String(moment(config.mainSale.opening, config.dateFormat).unix()))
        );
        expect(await tokenVesting.duration.call()).to.be.bignumber.equal(
          new BN(String(moment.duration().add(2, 'years').asSeconds()))
        );
        expect(await tokenVesting.revocable.call()).to.be.equal(false);

        expect(await token.balanceOf.call(tokenVesting.address)).to.be.bignumber.equal(
          Web3.utils.toWei(new BN(String(member.amount)))
        );

        await shouldFail.reverting(tokenVesting.release(token.address, {from: member.owner}));
      });
    };

    config.team.forEach(member => testTokenVestingContract('team member', member));
    config.advisor.forEach(advisor => testTokenVestingContract('advisor', advisor));
  });

  describe('PreSale', () => {
    let presale;

    before(async () => {
      presale = await AsureCrowdsale.at(config.preSale.addr);
    });

    it('should have been initialized correctly', async () => {
      expect(await presale.bonusRate.call()).to.be.bignumber.equal(new BN('274'), 'bonusRate');
      expect(await presale.bonusTime.call()).to.be.bignumber.equal(
        new BN(String(moment(config.preSale.bonusTime, config.dateFormat).unix())), 'bonusTime'
      );
      expect(await presale.defaultRate.call()).to.be.bignumber.equal(new BN('183'), 'defaultRate');
      expect(await presale.owner.call()).to.equalIgnoreCase(config.owner, 'owner');
      expect(await presale.wallet.call()).to.equalIgnoreCase(config.crowdsaleWallet, 'wallet');
      expect(await presale.token.call()).to.equalIgnoreCase(token.address, 'token');
      expect(await presale.openingTime.call()).to.be.bignumber.equal(
        new BN(String(moment(config.preSale.opening, config.dateFormat).unix())), 'openingTime'
      );
      expect(await presale.closingTime.call()).to.be.bignumber.equal(
        new BN(String(moment(config.preSale.closing, config.dateFormat).unix())), 'closingTime'
      );

      expect(await token.balanceOf.call(presale.address)).to.be.bignumber.equal(
        Web3.utils.toWei(new BN('10000000')), 'balanceOf presale'
      );

      expect(await presale.isOpen.call()).to.be.equal(false, 'isOpen');
      expect(await presale.hasClosed.call()).to.be.equal(false, 'hasClosed');
    });

    it('should sell ASR token with bonusRate in first week', function () {

    });
  });
});
