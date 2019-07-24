const {BN, time, constants, expectEvent, balance, shouldFail} = require('openzeppelin-test-helpers');
const moment = require('moment');
const Web3 = require('web3');
const {expect} = require('chai');
const chai = require('chai');
chai.use(require('chai-string'));
const {loadCrowdsaleConfig} = require("../utils/migrations");
const {advanceBlocktime, isolateAllTests} = require("../utils/testHelpers");

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
  isolateAllTests(() => {
    let token, crowdsaleWalletTracker;

    before(async () => {
      token = await AsureToken.at(config.token.addr);
      crowdsaleWalletTracker = await balance.tracker(config.crowdsaleWallet);
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
        expect(await token.balanceOf.call(config.bounty.addr)).to.be.bignumber.equal(
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
      let investors, bonusRate, defaultRate, presale;

      before(async () => {
        investors = accounts.slice(100, 140);
        bonusRate = new BN('274');
        defaultRate = new BN('183');
        presale = await AsureCrowdsale.at(config.preSale.addr);
      });

      it('should have been initialized correctly', async () => {
        expect(await presale.bonusRate.call()).to.be.bignumber.equal(bonusRate, 'bonusRate');
        expect(await presale.bonusTime.call()).to.be.bignumber.equal(
          new BN(String(moment(config.preSale.bonusTime, config.dateFormat).unix())), 'bonusTime'
        );
        expect(await presale.defaultRate.call()).to.be.bignumber.equal(defaultRate, 'defaultRate');
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

      it('should have whitelisted all investors', async () => {
        await presale.addWhitelistedAccounts(investors, {from: config.owner});

        for (let investor of investors) {
          expect(await presale.isWhitelisted.call(investor)).to.be.equal(true);
        }
      });

      describe('in first week', () => {
        it('should be open', async () => {
          await advanceBlocktime(moment(config.preSale.opening, config.dateFormat));
          expect(await presale.isOpen()).to.equal(true);
        });

        it('should sell ASR tokens with bonusRate', async () => {
          const earlyInvestors = investors.slice(0, 20);

          expect(earlyInvestors.length).to.be.equal(20);
          for (let investor of earlyInvestors) {
            await presale.buyTokens(investor, {
              from: investor,
              value: Web3.utils.toWei('1000')
            });

            expect(await token.balanceOf.call(investor)).to.be.bignumber.equal(
              Web3.utils.toWei(new BN('274000'))
            );
          }

          expect(await token.balanceOf.call(presale.address)).to.be.bignumber.equal(
            Web3.utils.toWei(new BN('4520000'))
          );
          expect(await crowdsaleWalletTracker.delta()).to.be.bignumber.equal(
            Web3.utils.toWei(new BN('20000'))
          );
        });
      });

      describe('in second week', () => {
        it('should be open', async () => {
          await advanceBlocktime(moment(config.preSale.bonusTime, config.dateFormat).add(1, 'second'));
          expect(await presale.isOpen()).to.equal(true);
        });

        it('should sell ASR tokens with defaultRate', async () => {
          const defaultInvestors = investors.slice(20, 40);

          expect(defaultInvestors.length).to.be.equal(20);
          for (let investor of defaultInvestors) {
            await presale.buyTokens(investor, {
              from: investor,
              value: Web3.utils.toWei('1000')
            });

            expect(await token.balanceOf.call(investor)).to.be.bignumber.equal(
              Web3.utils.toWei(new BN('183000'))
            );
          }

          expect(await token.balanceOf.call(presale.address)).to.be.bignumber.equal(
            Web3.utils.toWei(new BN('860000'))
          );
          expect(await crowdsaleWalletTracker.delta()).to.be.bignumber.equal(
            Web3.utils.toWei(new BN('20000'))
          );
        });
      });

      describe('after closed', () => {
        it('should be open', async () => {
          await advanceBlocktime(moment(config.preSale.closing, config.dateFormat).add(1, 'second'));
          expect(await presale.isOpen()).to.equal(false);
          expect(await presale.hasClosed()).to.equal(true);
        });

        it('everyone should be able to burn remaining tokens', async () => {
          expect(await token.balanceOf.call(presale.address)).to.be.bignumber.equal(
            Web3.utils.toWei(new BN('860000'))
          );

          await presale.burn();

          expect(await token.balanceOf.call(presale.address)).to.be.bignumber.equal(
            Web3.utils.toWei(new BN('0'))
          );
          expect(await token.totalSupply.call()).to.be.bignumber.equal(
            (await token.cap()).sub(Web3.utils.toWei(new BN('860000')))
          );
        });
      });
    });

    describe('MainSale', () => {
      let investors, bonusRate, defaultRate, mainsale;

      before(async () => {
        investors = accounts.slice(140, 180);
        bonusRate = new BN('161');
        defaultRate = new BN('137');
        mainsale = await AsureCrowdsale.at(config.mainSale.addr);
      });

      it('should have been initialized correctly', async () => {
        expect(await mainsale.bonusRate.call()).to.be.bignumber.equal(bonusRate, 'bonusRate');
        expect(await mainsale.bonusTime.call()).to.be.bignumber.equal(
          new BN(String(moment(config.mainSale.bonusTime, config.dateFormat).unix())), 'bonusTime'
        );
        expect(await mainsale.defaultRate.call()).to.be.bignumber.equal(defaultRate, 'defaultRate');
        expect(await mainsale.owner.call()).to.equalIgnoreCase(config.owner, 'owner');
        expect(await mainsale.wallet.call()).to.equalIgnoreCase(config.crowdsaleWallet, 'wallet');
        expect(await mainsale.token.call()).to.equalIgnoreCase(token.address, 'token');
        expect(await mainsale.openingTime.call()).to.be.bignumber.equal(
          new BN(String(moment(config.mainSale.opening, config.dateFormat).unix())), 'openingTime'
        );
        expect(await mainsale.closingTime.call()).to.be.bignumber.equal(
          new BN(String(moment(config.mainSale.closing, config.dateFormat).unix())), 'closingTime'
        );

        expect(await token.balanceOf.call(mainsale.address)).to.be.bignumber.equal(
          Web3.utils.toWei(new BN('35000000')), 'balanceOf mainsale'
        );

        expect(await mainsale.isOpen.call()).to.be.equal(false, 'isOpen');
        expect(await mainsale.hasClosed.call()).to.be.equal(false, 'hasClosed');
      });

      it('should have whitelisted all investors', async () => {
        await mainsale.addWhitelistedAccounts(investors, {from: config.owner});

        for (let investor of investors) {
          expect(await mainsale.isWhitelisted.call(investor)).to.be.equal(true);
        }
      });

      describe('in first week', () => {
        it('should be open', async () => {
          await advanceBlocktime(moment(config.mainSale.opening, config.dateFormat));
          expect(await mainsale.isOpen()).to.equal(true);
        });

        it('should sell ASR tokens with bonusRate', async () => {
          const earlyInvestors = investors.slice(0, 20);

          expect(earlyInvestors.length).to.be.equal(20);
          for (let investor of earlyInvestors) {
            await mainsale.buyTokens(investor, {
              from: investor,
              value: Web3.utils.toWei('1000')
            });

            expect(await token.balanceOf.call(investor)).to.be.bignumber.equal(
              Web3.utils.toWei(new BN('161000'))
            );
          }

          expect(await token.balanceOf.call(mainsale.address)).to.be.bignumber.equal(
            Web3.utils.toWei(new BN('31780000'))
          );
          expect(await crowdsaleWalletTracker.delta()).to.be.bignumber.equal(
            Web3.utils.toWei(new BN('20000'))
          );
        });
      });

      describe('in second week', () => {
        it('should be open', async () => {
          await advanceBlocktime(moment(config.mainSale.bonusTime, config.dateFormat).add(1, 'second'));
          expect(await mainsale.isOpen()).to.equal(true);
        });

        xit('should tranfer parts to an IEO', async () => {
          const ieo = accounts[10];
          const value = Web3.utils.toWei(new BN('29040001'));

          await mainsale.transferToIEO(ieo, value, {from: config.owner});
        });

        it('should sell ASR tokens with defaultRate', async () => {
          const defaultInvestors = investors.slice(20, 40);

          expect(defaultInvestors.length).to.be.equal(20);
          for (let investor of defaultInvestors) {
            await mainsale.buyTokens(investor, {
              from: investor,
              value: Web3.utils.toWei('1000')
            });

            expect(await token.balanceOf.call(investor)).to.be.bignumber.equal(
              Web3.utils.toWei(new BN('137000'))
            );
          }

          expect(await token.balanceOf.call(mainsale.address)).to.be.bignumber.equal(
            Web3.utils.toWei(new BN('29040000'))
          );
          expect(await crowdsaleWalletTracker.delta()).to.be.bignumber.equal(
            Web3.utils.toWei(new BN('20000'))
          );
        });
      });

      describe('after closed', () => {
        it('should be open', async () => {
          await advanceBlocktime(moment(config.mainSale.closing, config.dateFormat).add(1, 'second'));
          expect(await mainsale.isOpen()).to.equal(false);
          expect(await mainsale.hasClosed()).to.equal(true);
        });

        it('everyone should be able to burn remaining tokens', async () => {
          expect(await token.balanceOf.call(mainsale.address)).to.be.bignumber.equal(
            Web3.utils.toWei(new BN('29040000'))
          );

          await mainsale.burn();

          expect(await token.balanceOf.call(mainsale.address)).to.be.bignumber.equal(
            Web3.utils.toWei(new BN('0'))
          );
          expect(await token.totalSupply.call()).to.be.bignumber.equal(
            (await token.cap()).sub(Web3.utils.toWei(new BN('860000').add(new BN('29040000'))))
          );
        });
      });
    });

    describe('Vested team and advisor tokens', () => {
      it('should be released two years after main sale opening', async () => {
        await advanceBlocktime(moment(config.mainSale.opening, config.dateFormat).add(2, 'years').add(1, 'second'));

        for (let member of config.team.concat(config.advisor)) {
          expect(await token.balanceOf.call(member.owner)).to.be.bignumber.equal(
            Web3.utils.toWei(new BN('0'))
          );

          const tokenVesting = await TokenVesting.at(member.addr);
          await tokenVesting.release(token.address, {from: member.owner});

          expect(await token.balanceOf.call(member.owner)).to.be.bignumber.equal(
            Web3.utils.toWei(new BN(String(member.amount)))
          );
        }
      });
    });
  });
});
