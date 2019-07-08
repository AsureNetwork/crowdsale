const Web3 = require('web3');
const {BN, time, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');
const {expect} = require('chai');

const AsureToken = artifacts.require('AsureToken');
const TestToken = artifacts.require('TestToken');

contract('AsureToken', async accounts => {
  let owner, name, symbol, decimals, maxCap, cap, token;

  before(async () => {
    owner = accounts[1];
    name = "Asure";
    symbol = "ASR";
    decimals = new BN('18');
    maxCap = Web3.utils.toWei(new BN((100 * 10**6)));

    /*
     * Leave 1 Wei for mint() test case.
     */
    cap = maxCap.sub(new BN('1'));

    token = await AsureToken.new(owner);

    await token.mint(owner, cap);
  });

  it('should verify test setup', async () => {
    expect(await token.totalSupply.call()).to.be.bignumber.equal(cap);
    expect(await token.balanceOf.call(owner)).to.be.bignumber.equal(cap);
  });

  describe('constructor', () => {
    it('should initialize "name", "symbol", "decimals", and "totalSupply"', async () => {
      expect(await token.name.call()).to.eq(name, 'name');
      expect(await token.symbol.call()).to.eq(symbol, 'symbol');
      expect(await token.decimals.call()).to.bignumber.equal(decimals, 'decimals');
      expect(await token.totalSupply.call()).to.bignumber.equal(cap, 'totalSupply');
    });

    it('should transfer ownership to new owner', async () => {
      expect(await token.owner.call()).to.be.equal(owner);
    });

    it('creator of the token should be a minter', async () => {
      expect(await token.isMinter.call(accounts[0])).to.be.eq(true);
    });

    it('owner of the token should not be a minter', async () => {
      expect(await token.isMinter.call(owner)).to.be.eq(false);
    });
  });

  describe('transfer', async () => {
    it('should revert if ASR tokens are transfered to the token contract itself', async () => {
      const from = owner;
      const to = token.address;
      const value = Web3.utils.toWei(new BN('1'));

      await shouldFail.reverting(token.transfer.sendTransaction(to, value, {from}));
    });
  });

  describe('mint', async () => {
    it('should revert if ASR tokens are minted to the token contract itself', async () => {
      const from = accounts[0];
      const to = token.address;
      const value = new BN('1');

      await shouldFail.reverting(token.mint.sendTransaction(to, value, {from}));
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
