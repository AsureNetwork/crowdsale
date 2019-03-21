const moment = require('moment');
const Web3 = require('web3');
// Import all required modules from openzeppelin-test-helpers
const {BN, time, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');
// Import preferred chai flavor: both expect and should are supported
const {expect} = require('chai');

const AsureToken = artifacts.require('AsureToken');

contract('AsureToken', async accounts => {


  const owner = accounts[0];
  const wallet = accounts[0];
  const maxCap = String(100 * 10 ** 6);

  const now = moment();
  const openingTime = now.clone().add(1, 'days');
  const closingTime = openingTime.clone().add(2, 'weeks');

  const openingTimeUnix = openingTime.unix();
  const closingTimeUnix = closingTime.unix();
  let token, presale, mainsale;

  it('should instantiate AsureToken', async () => {
    token = await AsureToken.new(owner,
      "AsureToken",
      "ASR",
      18,
      maxCap, {from: owner});

    let sender = await token.sender.call();
    console.log("sender", sender);
    console.log("owner", owner);
    await token.mint.sendTransaction(owner, maxCap, {from: owner});
    expect(token).to.be.an.instanceof(AsureToken);
  });

  it('should instantiate AsureToken correctly', async () => {
    const tokenName = await token.name.call();
    const tokenSymbol = await token.symbol.call();
    const tokenDecimals = await token.decimals.call();
    const tokenTotalSupply = await token.totalSupply.call();

    expect(tokenName).to.eq('AsureToken');
    expect(tokenSymbol).to.eq('ASR');
    expect(tokenDecimals.toNumber()).to.eq(18);
    expect(Web3.utils.toWei(Web3.utils.fromWei(tokenTotalSupply))).to.eq(maxCap);
  });

  it('should emergency Token Extraction transfer tokens', async () => {

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
