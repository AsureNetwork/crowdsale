const moment = require('moment');
const Web3 = require('web3');
// Import all required modules from openzeppelin-test-helpers
const {BN, time, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');
// Import preferred chai flavor: both expect and should are supported
const {expect} = require('chai');

const AsureToken = artifacts.require('AsureToken');

contract('AsureToken', async accounts => {
  let owner, maxCap, token;

  before(async () => {
    owner = accounts[0];
    maxCap = String(100 * 10 ** 6);

    token = await AsureToken.new(owner,
      "AsureToken",
      "ASR",
      18,
      maxCap, {from: owner});

    await token.mint.sendTransaction(owner, maxCap, {from: owner});
  });

  it('should verify test setup', async () => {
    expect(await token.totalSupply()).to.be.bignumber.equal(maxCap);
  });

  describe('constructor', () => {
    it('should initialize "tokenName" and "tokenSymbol"', async () => {
      const tokenName = await token.name.call();
      const tokenSymbol = await token.symbol.call();
      expect(tokenName).to.eq('AsureToken');
      expect(tokenSymbol).to.eq('ASR');
    });

    it('should initialize "tokenDecimals" and "tokenTotalSupply"', async () => {
      const tokenDecimals = await token.decimals.call();
      const tokenTotalSupply = await token.totalSupply.call();

      expect(tokenDecimals.toNumber()).to.eq(18);
      expect(Web3.utils.toWei(Web3.utils.fromWei(tokenTotalSupply))).to.eq(maxCap);
    });

    it('should transfer ownership to new owner', async () => {
      expect(await token.owner()).to.be.equal(owner);
    });
  });

  describe('emergencyTokenExtraction', () => {
    it('should transfer wrong tokens', async () => {

      let wrongToken = await AsureToken.new(owner,
        "WrongToken",
        "WRG",
        18,
        maxCap, {from: owner});
      await wrongToken.mint.sendTransaction(token.address, String(1000), {from: owner});

      let balanceOfWrongTokenInToken = await wrongToken.balanceOf.call(token.address);
      expect(Web3.utils.toWei(Web3.utils.fromWei(balanceOfWrongTokenInToken))).to.eq('1000');

      await token.emergencyTokenExtraction.sendTransaction(wrongToken.address, {from: owner});

      let balanceOfWrongTokenInOwner = await wrongToken.balanceOf.call(owner);
      expect(Web3.utils.toWei(Web3.utils.fromWei(balanceOfWrongTokenInOwner))).to.eq('1000');

      balanceOfWrongTokenInToken = await wrongToken.balanceOf.call(token.address);
      expect(Web3.utils.toWei(Web3.utils.fromWei(balanceOfWrongTokenInToken))).to.eq('0');
    });
  });


});
