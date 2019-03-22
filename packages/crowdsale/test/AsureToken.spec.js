const Web3 = require('web3');
const {BN, time, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');
const {expect} = require('chai');

const AsureToken = artifacts.require('AsureToken');
const TestToken = artifacts.require('TestToken');

contract('AsureToken', async accounts => {
  let owner, name, symbol, decimals, maxCap, token;

  before(async () => {
    owner = accounts[1];
    name = "Asure";
    symbol = "ASR";
    decimals = new BN('18');
    maxCap = new BN(String(100 * 10 ** (6 + decimals)));

    token = await AsureToken.new(owner);

    await token.mint(owner, maxCap);
  });

  it('should verify test setup', async () => {
    expect(await token.totalSupply()).to.be.bignumber.equal(maxCap);
  });

  describe('constructor', () => {
    it('should initialize "name", "symbol", "decimals", and "totalSupply"', async () => {
      expect(await token.name.call()).to.eq(name, 'name');
      expect(await token.symbol.call()).to.eq(symbol, 'symbol');
      expect(await token.decimals.call()).to.bignumber.equal(decimals, 'decimals');
      expect(await token.totalSupply.call()).to.bignumber.equal(maxCap, 'totalSupply');
    });

    it('should transfer ownership to new owner', async () => {
      expect(await token.owner()).to.be.equal(owner);
    });

    it('creator of the token should be a minter', async () => {
      expect(await token.isMinter(accounts[0])).to.be.eq(true);
    });

    it('owner of the token should not be a minter', async () => {
      expect(await token.isMinter(owner)).to.be.eq(false);
    });
  });

  describe('emergencyTokenExtraction', () => {
    let testToken, amount;

    beforeEach(async () => {
      amount = new BN('1000');
      testToken = await TestToken.new();

      await testToken.mint(token.address, amount);
      expect(await testToken.balanceOf.call(token.address)).to.bignumber.equal(amount);
    });

    it('should revert if not called by owner', async () => {
      await shouldFail.reverting(token.emergencyTokenExtraction(testToken.address));
    });

    it('should transfer wrong tokens', async () => {
      await token.emergencyTokenExtraction(testToken.address, {from: owner});

      expect(await testToken.balanceOf.call(owner)).to.bignumber.equal(amount);
      expect(await testToken.balanceOf.call(token.address)).to.bignumber.equal(new BN('0'));
    });

    it('should revert if balance of specified token is zero', async () => {
      await token.emergencyTokenExtraction(testToken.address, {from: owner});
      expect(await testToken.balanceOf.call(token.address)).to.bignumber.equal(new BN('0'));

      await shouldFail.reverting(token.emergencyTokenExtraction(testToken.address, {from: owner}));
    });
  });
});
