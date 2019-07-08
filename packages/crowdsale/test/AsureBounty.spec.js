const Web3 = require('web3');
const {BN, time, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');
const {expect} = require('chai');

const AsureBounty = artifacts.require('AsureBounty');
const AsureToken = artifacts.require('AsureToken');
const TestToken = artifacts.require('TestToken');

contract('AsureBounty', async accounts => {
  let owner, maxCap, token, bounty;
  let tokenAddr, bountyAddr;
  //let decimals, decimalFactor;

  before(async () => {
    owner = accounts[1];
    //decimals = 18;
    //decimalFactor = 10^decimals;
    maxCap = Web3.utils.toWei(new BN('1000000'));

    token = await AsureToken.new(owner);
    tokenAddr = token.address;
    bounty = await AsureBounty.new(owner, tokenAddr);
    bountyAddr = bounty.address;
    await token.mint(bountyAddr, maxCap);
  });

  it('should verify test setup', async () => {
    expect(await token.totalSupply.call()).to.be.bignumber.equal(maxCap);
    expect(await token.balanceOf.call(bountyAddr)).to.be.bignumber.equal(maxCap);
  });

  describe('constructor', () => {
    it('should transfer ownership to new owner', async () => {
      expect(await bounty.owner.call()).to.be.equal(owner);
    });

    it('creator of the token should be a minter', async () => {
      expect(await token.isMinter.call(accounts[0])).to.be.eq(true);
    });

    it('owner of the token should not be a minter', async () => {
      expect(await token.isMinter.call(owner)).to.be.eq(false);
    });
  });

  describe('drop', () => {
    it('should revert if recipients and values have not the same length', async () => {
      await shouldFail.reverting(
        bounty.drop.sendTransaction([accounts[5]], [], {from: owner})
      );
    });

    it('should revert if specified amount is not available', async () => {
      await shouldFail.reverting(
        bounty.drop.sendTransaction([accounts[5]], [maxCap.add(new BN('1'))], {from: owner})
      );
    });

    it('should drop called by owner', async () => {
      let recipients = [], values = [];
      for (let i = 0; i < 5; i++) {
        recipients.push(accounts[5]);
        values.push(Web3.utils.toWei(new BN('100')));
      }
      let startBalance = await token.balanceOf.call(bountyAddr);
      let sum = Web3.utils.toWei(new BN('500'));
      expect(startBalance).to.be.bignumber.greaterThan(sum);

      let tx = await bounty.drop.sendTransaction(recipients, values, {from: owner});
      let endBalance = await token.balanceOf.call(bountyAddr);

      expect(tx.receipt.gasUsed).to.be.lt(250000);
      expect(startBalance.sub(endBalance)).to.be.bignumber.equal(sum);
      expect(await token.balanceOf.call(accounts[5])).to.be.bignumber.equal(sum);
      expect(await token.balanceOf.call(bountyAddr)).to.be.bignumber.equal(maxCap.sub(sum));
    });
  });

  describe('airdrop', () => {
    it('should airdrop called by owner', async () => {
      let recipients = [];
      for (let i = 0; i < 5; i++) {
        recipients.push(accounts[6]);
      }
      let startBalance = await token.balanceOf.call(bountyAddr);
      let sum = Web3.utils.toWei(new BN('500'));
      expect(startBalance).to.be.bignumber.greaterThan(sum);
      expect(startBalance).to.be.bignumber.eq(maxCap.sub(sum));

      let tx = await bounty.airdrop.sendTransaction(recipients, {from: owner});
      let endBalance = await token.balanceOf.call(bountyAddr);

      expect(tx.receipt.gasUsed).to.be.lt(250000);
      expect(startBalance.sub(endBalance)).to.be.bignumber.equal(sum);
      expect(await token.balanceOf.call(accounts[6])).to.be.bignumber.equal(sum);
    });
  });
});
