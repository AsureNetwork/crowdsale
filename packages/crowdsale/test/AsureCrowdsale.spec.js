const moment = require('moment');
const Web3 = require('web3');
const {BN, time, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');
const {expect} = require('chai');
const {isolateTests, initialBlocktime} = require("../utils/testHelpers");

const AsureToken = artifacts.require('AsureToken');
const AsureCrowdsale = artifacts.require('AsureCrowdsale');

contract('AsureCrowdsale', async accounts => {
  let owner, wallet, maxCap, saleCap, token, singleWhitelistCrowdsale, crowdsale;
  let openingTime, bonusTime, closingTime;
  let defaultRate, bonusRate;

  before(async () => {
    owner = accounts[1];
    wallet = accounts[2];
    maxCap = Web3.utils.toWei(new BN((100 * 10**6)));
    saleCap = Web3.utils.toWei(new BN((10 * 10**6)));
    openingTime = initialBlocktime.clone().add(1, 'days');
    bonusTime = openingTime.clone().add(1, 'weeks');
    closingTime = openingTime.clone().add(2, 'weeks');
    bonusRate = 1000;
    defaultRate = 500;
    token = await AsureToken.new(owner);

    singleWhitelistCrowdsale = await AsureCrowdsale.new(
      bonusRate,
      bonusTime.unix(),
      defaultRate,
      accounts[0],
      wallet,
      token.address,
      openingTime.unix(),
      closingTime.unix()
    );

    crowdsale = await AsureCrowdsale.new(
      bonusRate,
      bonusTime.unix(),
      defaultRate,
      owner,
      wallet,
      token.address,
      openingTime.unix(),
      closingTime.unix()
    );

    await token.mint(crowdsale.address, saleCap);
    await token.mint(wallet, maxCap.sub(saleCap));
  });

  it('should verify test setup', async () => {
    expect(await crowdsale.openingTime.call()).to.be.bignumber.equal(new BN(openingTime.unix()));
    expect(await crowdsale.closingTime.call()).to.be.bignumber.equal(new BN(closingTime.unix()));
    expect(await crowdsale.token.call()).to.be.equal(token.address);
    expect(await crowdsale.wallet.call()).to.be.equal(wallet);
  });

  describe('constructor', () => {
    it('should add whitelist admins to crowdsale', async () => {
      let isSenderAdminInSingleWhitelist = await singleWhitelistCrowdsale.isWhitelistAdmin.call(accounts[0]);
      let isOwnerAdminInSingleWhitelist = await singleWhitelistCrowdsale.isWhitelistAdmin.call(owner);
      expect(isSenderAdminInSingleWhitelist).to.be.equal(true);
      expect(isOwnerAdminInSingleWhitelist).to.be.equal(false);

      let isSenderAdminInCrowdsale = await crowdsale.isWhitelistAdmin.call(accounts[0]);
      let isOwnerAdminInCrowdsale = await crowdsale.isWhitelistAdmin.call(owner);
      expect(isSenderAdminInCrowdsale).to.be.equal(true);
      expect(isOwnerAdminInCrowdsale).to.be.equal(true);
    });

    it('should transfer token ownership to new owner', async () => {
      expect(await token.owner.call()).to.be.equal(owner);
    });

    it('should transfer crowdsale ownership to new owner', async () => {
      expect(await crowdsale.owner.call()).to.be.equal(owner);
    });
  });

  isolateTests(() => {
    describe('burn', () => {
      it('should revert before crowdsale opens', async () => {
        expect(await crowdsale.isOpen.call()).to.eq(false);
        expect(await crowdsale.hasClosed.call()).to.eq(false);

        await shouldFail.reverting(crowdsale.burn());
      });

      it('should revert while crowdsale is open', async () => {
        await time.increase(time.duration.days(2));
        expect(await crowdsale.isOpen.call()).to.eq(true);

        await shouldFail.reverting(crowdsale.burn());
      });

      it('should burn after crowdsale unsold tokens', async () => {
        await time.increase(time.duration.weeks(5));
        expect(await crowdsale.hasClosed.call()).to.eq(true);

        crowdsale.burn();

        expect(await token.totalSupply.call()).to.bignumber.equal(maxCap.sub(saleCap))
      });
    });

    describe('transferToIEO', () => {
      const ieo = accounts[6];

      it('should revert if not called by owner', async () => {
        const value = Web3.utils.toWei(new BN('1'));
        await shouldFail.reverting(crowdsale.transferToIEO.sendTransaction(ieo, value, { from: accounts[6] }));
      });

      it('should revert if crowdsale has closed', async () => {
        await time.increase(time.duration.weeks(5));
        expect(await crowdsale.hasClosed.call()).to.eq(true);

        const value = Web3.utils.toWei(new BN('1'));
        await shouldFail.reverting(crowdsale.transferToIEO.sendTransaction(ieo, value, { from: owner }));
      });

      it('should revert if specified value is bigger than the contract holds', async () => {
        const value = saleCap.add(new BN('1'));
        await shouldFail.reverting(crowdsale.transferToIEO.sendTransaction(ieo, value, { from: owner }));
      });

      it('should transfer half of the funds to the IEO address', async () => {
        const value = saleCap.div(new BN('2'));
        await crowdsale.transferToIEO.sendTransaction(ieo, value, { from: owner });

        expect(await token.balanceOf.call(ieo)).to.bignumber.equal(value);
      });
    });

    describe('addWhitelistedAccounts', () => {
      it('should revert if not called by owner or creator of the crowdsale', async () => {
        await shouldFail.reverting(crowdsale.addWhitelistedAccounts([accounts[1]], {from: accounts[2]}));
      });

      it('should add whitelist users', async () => {
        await crowdsale.addWhitelistedAccounts([
            accounts[1],
            accounts[2],
            accounts[3],
            accounts[4],
            accounts[5]
          ],
          {from: owner}
        );
        expect(await crowdsale.isWhitelisted.call(accounts[0])).to.eq(false);
        expect(await crowdsale.isWhitelisted.call(accounts[1])).to.eq(true);
        expect(await crowdsale.isWhitelisted.call(accounts[2])).to.eq(true);
        expect(await crowdsale.isWhitelisted.call(accounts[3])).to.eq(true);
        expect(await crowdsale.isWhitelisted.call(accounts[4])).to.eq(true);
        expect(await crowdsale.isWhitelisted.call(accounts[5])).to.eq(true);
      });
    });

    describe('buyTokens', () => {
      const beneficiary = accounts[3];

      beforeEach(async () => {
        await time.increase(time.duration.days(5));
        expect(await crowdsale.isOpen.call()).to.eq(true);
      });

      it('should revert if the beneficiary is not whitelisted', async () => {
        await shouldFail.reverting(crowdsale.buyTokens.sendTransaction(beneficiary, {
          value: Web3.utils.toWei(new BN('1'), 'ether'),
          from: beneficiary
        }));
      });

      it('should revert if amount is below minimum contribution rate of 0.5 ETH', async () => {
        await crowdsale.addWhitelisted.sendTransaction(beneficiary, {from: owner});

        await shouldFail.reverting(crowdsale.buyTokens.sendTransaction(beneficiary, {
          value: Web3.utils.toWei(new BN('1'), 'ether').div(new BN('2')).sub(new BN('1')),
          from: beneficiary
        }));
      });

      it('should buy tokens for 0.5 ETH', async () => {
        const value = Web3.utils.toWei(new BN('1'), 'ether').div(new BN('2'));
        await crowdsale.addWhitelisted.sendTransaction(beneficiary, {from: owner});

        await crowdsale.buyTokens.sendTransaction(beneficiary, {value, from: beneficiary});

        expect(await crowdsale.weiRaised.call()).to.bignumber.equal(value);
        expect(await token.balanceOf.call(beneficiary)).to.bignumber.equal(value.mul(new BN(bonusRate.toString())));
      });

      it('should buy tokens for 10 ETH', async () => {
        const value = Web3.utils.toWei(new BN('10'), 'ether');
        await crowdsale.addWhitelisted.sendTransaction(beneficiary, {from: owner});

        await crowdsale.buyTokens.sendTransaction(beneficiary, {value, from: beneficiary});

        expect(await crowdsale.weiRaised.call()).to.bignumber.equal(value);
        expect(await token.balanceOf.call(beneficiary)).to.bignumber.equal(value.mul(new BN(bonusRate.toString())));
      });
    });
  });
});
