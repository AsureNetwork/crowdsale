const moment = require('moment');
const Web3 = require('web3');
const {BN, shouldFail} = require('openzeppelin-test-helpers');
const {expect} = require('chai');
const {initialBlocktime} = require("../utils/testHelpers");

const AsureToken = artifacts.require('AsureToken');
const AsureCrowdsale = artifacts.require('AsureCrowdsale');
const AsureCrowdsaleDeployer = artifacts.require('AsureCrowdsaleDeployer');

contract('AsureCrowdsaleDeployer', async accounts => {
  const owner = accounts[1];
  const wallet = accounts[2];
  const faundation = accounts[3];
  const bounty = accounts[4];
  const familyFriends = accounts[5];
  const team1 = accounts[6];
  const team2 = accounts[7];
  const advisor1 = accounts[8];
  const advisor2 = accounts[9];

  let crowdsaleDeployer, token;

  beforeEach(async () => {
    crowdsaleDeployer = await AsureCrowdsaleDeployer.new(owner);
  });

  describe('constructor', () => {
    it('should transfer ownership to new owner', async () => {
      expect(await crowdsaleDeployer.owner.call()).to.be.equal(owner);
    });

    it('should create AsureToken and transfer ownership to new owner', async () => {
      const token = await AsureToken.at(await crowdsaleDeployer.token.call());

      expect(await token.owner.call()).to.be.equal(owner);
    });
  });

  describe('mint', () => {
    beforeEach(async () => {
      token = await AsureToken.at(await crowdsaleDeployer.token.call());
    });

    it('should only be callable by owner', async () => {
      await shouldFail.reverting(crowdsaleDeployer.mint(
        faundation,
        bounty,
        familyFriends,
        [team1],
        [8000000],
        [advisor1],
        [2000000],
      ));
    });

    it('should revert if team addresses and team amounts do not have the same length', async () => {
      await shouldFail.reverting(crowdsaleDeployer.mint(
        faundation,
        bounty,
        familyFriends,
        [team1, team2],
        [8000000],
        [advisor1],
        [2000000],
        {from: owner}
      ));
    });

    it('should revert if advisor addresses and advisor amounts do not have the same length', async () => {
      await shouldFail.reverting(crowdsaleDeployer.mint(
        faundation,
        bounty,
        familyFriends,
        [team1],
        [8000000],
        [advisor1, advisor2],
        [2000000],
        {from: owner}
      ));
    });

    it('should revert if amounts do not sum up correctly', async () => {
      await shouldFail.reverting(crowdsaleDeployer.mint(
        faundation,
        bounty,
        familyFriends,
        [team1],
        [9000000], // wrong amount - allowed are only 8000000
        [advisor1],
        [2000000],
        {from: owner}
      ));
    });

    it('should revert if amounts are not split correctly between the team and advisors', async () => {
      await shouldFail.reverting(crowdsaleDeployer.mint(
        faundation,
        bounty,
        familyFriends,
        [team1],
        [9000000], // wrong amount - allowed are only 8000000
        [advisor1],
        [1000000], // also wrong amount but together they make up the correct amount again
        {from: owner}
      ));
    });

    it('should revert if amounts do not sum up correctly because it is called a second time', async () => {
      await crowdsaleDeployer.mint(
        faundation,
        bounty,
        familyFriends,
        [team1],
        [8000000],
        [advisor1],
        [2000000],
        {from: owner}
      );

      await shouldFail.reverting(crowdsaleDeployer.mint(
        faundation,
        bounty,
        familyFriends,
        [team1],
        [8000000],
        [advisor1],
        [2000000],
        {from: owner}
      ));
    });

    it('should mint tokens with specified amounts', async () => {
      await crowdsaleDeployer.mint(
        faundation,
        bounty,
        familyFriends,
        [team1, team2],
        [4000000, 4000000],
        [advisor1, advisor2],
        [1000000, 1000000],
        {from: owner}
      );

      expect(await token.balanceOf.call(faundation)).to.be.bignumber.equal(Web3.utils.toWei(new BN('35000000')));
      expect(await token.balanceOf.call(bounty)).to.be.bignumber.equal(Web3.utils.toWei(new BN('5000000')));
      expect(await token.balanceOf.call(familyFriends)).to.be.bignumber.equal(Web3.utils.toWei(new BN('5000000')));
      expect(await token.balanceOf.call(team1)).to.be.bignumber.equal(Web3.utils.toWei(new BN('4000000')));
      expect(await token.balanceOf.call(team2)).to.be.bignumber.equal(Web3.utils.toWei(new BN('4000000')));
      expect(await token.balanceOf.call(advisor1)).to.be.bignumber.equal(Web3.utils.toWei(new BN('1000000')));
      expect(await token.balanceOf.call(advisor2)).to.be.bignumber.equal(Web3.utils.toWei(new BN('1000000')));
    });
  });

  describe('createPreSale', () => {
    const bonusRate = 200 * (1 / 0.5); // bonus rate: ETH = 200 USD + 50% bonus
    const defaultRate = 200 * (1 / 0.5); // default rate: ETH = 200 USD + 50% bonus

    const openingTime = initialBlocktime.clone().add(1, 'days');
    const bonusTime = openingTime.clone().add(1, 'week');
    const closingTime = openingTime.clone().add(2, 'weeks');

    beforeEach(async () => {
      token = await AsureToken.at(await crowdsaleDeployer.token.call());
      await crowdsaleDeployer.mint(
        faundation,
        bounty,
        familyFriends,
        [team1],
        [8000000],
        [advisor1],
        [2000000],
        {from: owner}
      );
    });

    it('should only be callable by owner', async () => {
      await shouldFail.reverting(crowdsaleDeployer.createPreSale(
        bonusRate,
        bonusTime.unix(),
        defaultRate,
        owner,
        wallet,
        openingTime.unix(),
        closingTime.unix()
      ));
    });

    it('should only be callable if presale does not yet exists', async () => {
      await crowdsaleDeployer.createPreSale(
        bonusRate,
        bonusTime.unix(),
        defaultRate,
        owner,
        wallet,
        openingTime.unix(),
        closingTime.unix(),
        {from: owner}
      );

      await shouldFail.reverting(crowdsaleDeployer.createPreSale(
        bonusRate,
        bonusTime.unix(),
        defaultRate,
        owner,
        wallet,
        openingTime.unix(),
        closingTime.unix(),
        {from: owner}
      ));
    });

    it('should instantiate presale correctly', async () => {
      await crowdsaleDeployer.createPreSale(
        bonusRate,
        bonusTime.unix(),
        defaultRate,
        owner,
        wallet,
        openingTime.unix(),
        closingTime.unix(),
        {from: owner}
      );

      const presale = await AsureCrowdsale.at(await crowdsaleDeployer.presale.call());
      expect(await presale.bonusRate.call()).to.be.bignumber.equal(new BN(String(bonusRate)));
      expect(await presale.bonusTime.call()).to.be.bignumber.equal(new BN(String(bonusTime.unix())));
      expect(await presale.defaultRate.call()).to.be.bignumber.equal(new BN(String(defaultRate)));
      expect(await presale.owner.call()).to.eq(owner);
      expect(await presale.wallet.call()).to.eq(wallet);
      expect(await presale.openingTime.call()).to.be.bignumber.equal(new BN(String(openingTime.unix())));
      expect(await presale.closingTime.call()).to.be.bignumber.equal(new BN(String(closingTime.unix())));
    });

    it('should mint tokens for presale with specified amount', async () => {
      await crowdsaleDeployer.createPreSale(
        bonusRate,
        bonusTime.unix(),
        defaultRate,
        owner,
        wallet,
        openingTime.unix(),
        closingTime.unix(),
        {from: owner}
      );

      const presale = await AsureCrowdsale.at(await crowdsaleDeployer.presale.call());
      expect(await token.balanceOf.call(presale.address)).to.be.bignumber.equal(Web3.utils.toWei(new BN('10000000')));
    });
  });


  describe('createMainSale', () => {
    const bonusRate = 200 * (1 / 0.5); // bonus rate: ETH = 200 USD + 50% bonus
    const defaultRate = 200 * (1 / 0.5); // default rate: ETH = 200 USD + 50% bonus

    const openingTime = initialBlocktime.clone().add(1, 'days');
    const bonusTime = openingTime.clone().add(1, 'week');
    const closingTime = openingTime.clone().add(2, 'weeks');

    beforeEach(async () => {
      token = await AsureToken.at(await crowdsaleDeployer.token.call());
      await crowdsaleDeployer.mint(
        faundation,
        bounty,
        familyFriends,
        [team1],
        [8000000],
        [advisor1],
        [2000000],
        {from: owner}
      );
      await crowdsaleDeployer.createPreSale(
        bonusRate,
        bonusTime.unix(),
        defaultRate,
        owner,
        wallet,
        openingTime.unix(),
        closingTime.unix(),
        {from: owner}
      );
    });

    it('should only be callable by owner', async () => {
      await shouldFail.reverting(crowdsaleDeployer.createMainSale(
        bonusRate,
        bonusTime.unix(),
        defaultRate,
        owner,
        wallet,
        openingTime.unix(),
        closingTime.unix()
      ));
    });

    it('should only be callable if mainsale does not yet exists', async () => {
      await crowdsaleDeployer.createMainSale(
        bonusRate,
        bonusTime.unix(),
        defaultRate,
        owner,
        wallet,
        openingTime.unix(),
        closingTime.unix(),
        {from: owner}
      );

      await shouldFail.reverting(crowdsaleDeployer.createMainSale(
        bonusRate,
        bonusTime.unix(),
        defaultRate,
        owner,
        wallet,
        openingTime.unix(),
        closingTime.unix(),
        {from: owner}
      ));
    });

    it('should instantiate mainsale correctly', async () => {
      await crowdsaleDeployer.createMainSale(
        bonusRate,
        bonusTime.unix(),
        defaultRate,
        owner,
        wallet,
        openingTime.unix(),
        closingTime.unix(),
        {from: owner}
      );

      const mainsale = await AsureCrowdsale.at(await crowdsaleDeployer.mainsale.call());
      expect(await mainsale.bonusRate.call()).to.be.bignumber.equal(new BN(String(bonusRate)));
      expect(await mainsale.bonusTime.call()).to.be.bignumber.equal(new BN(String(bonusTime.unix())));
      expect(await mainsale.defaultRate.call()).to.be.bignumber.equal(new BN(String(defaultRate)));
      expect(await mainsale.owner.call()).to.eq(owner);
      expect(await mainsale.wallet.call()).to.eq(wallet);
      expect(await mainsale.openingTime.call()).to.be.bignumber.equal(new BN(String(openingTime.unix())));
      expect(await mainsale.closingTime.call()).to.be.bignumber.equal(new BN(String(closingTime.unix())));
    });

    it('should mint tokens for mainsale with specified amount', async () => {
      await crowdsaleDeployer.createMainSale(
        bonusRate,
        bonusTime.unix(),
        defaultRate,
        owner,
        wallet,
        openingTime.unix(),
        closingTime.unix(),
        {from: owner}
      );

      const mainsale = await AsureCrowdsale.at(await crowdsaleDeployer.mainsale.call());
      expect(await token.balanceOf.call(mainsale.address)).to.be.bignumber.equal(Web3.utils.toWei(new BN('35000000')));
    });
  });
});
