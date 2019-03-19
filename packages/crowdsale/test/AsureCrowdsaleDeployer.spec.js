const moment = require('moment');
const Web3 = require('web3');

const AsureToken = artifacts.require('AsureToken');
const AsureCrowdsale = artifacts.require('AsureCrowdsale');
const AsureCrowdsaleDeployer = artifacts.require('AsureCrowdsaleDeployer');

contract('AsureCrowdsaleDeployer', async accounts => {
  const owner = accounts[0];
  const wallet = accounts[0];
  const maxCap = String(40 * 10 ** 6);
  const openingTime = moment();
  const closingTime = openingTime.clone().add(2, 'weeks');

  let token, crowdsale;

  it('should instantiate AsureToken and AsureCrowdsale', async () => {
    const deployer = await AsureCrowdsaleDeployer.new(
      wallet,
      openingTime.unix(),
      closingTime.unix()
    );

    const tokenAddress = await deployer.token.call();
    const crowdsaleAddress = await deployer.crowdsale.call();

    token = await AsureToken.at(tokenAddress);
    crowdsale = await AsureCrowdsale.at(crowdsaleAddress);

    expect(token).to.be.an.instanceof(AsureToken);
    expect(crowdsale).to.be.an.instanceof(AsureCrowdsale);
  });

  it('should instantiate AsureToken correctly', async () => {
    const tokenName = await token.name.call();
    const tokenSymbol = await token.symbol.call();
    const tokenDecimals = await token.decimals.call();
    const tokenTotalSupply = await token.totalSupply.call();
    const balanceOfCrowdsale = await token.balanceOf.call(crowdsale.address);

    expect(tokenName).to.eq('AsureToken');
    expect(tokenSymbol).to.eq('ASR');
    expect(tokenDecimals.toNumber()).to.eq(18);
    expect(Web3.utils.fromWei(tokenTotalSupply)).to.eq(maxCap);
    expect(Web3.utils.fromWei(balanceOfCrowdsale)).to.eq(maxCap);
  });

  it('should instantiate AsureCrowdsale correctly', async () => {
    const crowdsaleRate = await crowdsale.rate.call();
    const crowdsaleWallet = await crowdsale.wallet.call();
    const crowdsaleCap = await crowdsale.cap.call();
    const crowdsaleOpeningTime = await crowdsale.openingTime.call();
    const crowdsaleClosingTime = await crowdsale.closingTime.call();

    expect(crowdsaleRate.toNumber()).to.eq(1000);
    expect(crowdsaleWallet).to.eq(wallet);
    expect(Web3.utils.fromWei(crowdsaleCap)).to.eq(maxCap);
    expect(crowdsaleOpeningTime.toNumber()).to.eq(openingTime.unix());
    expect(crowdsaleClosingTime.toNumber()).to.eq(closingTime.unix());
  });

  it('should buy Asure tokens for 1 ETH', async () => {
    const beneficiary = accounts[2];
    const ethValue = Web3.utils.toWei('1');

    await crowdsale
      .buyTokens
      .sendTransaction(beneficiary, { value: ethValue, from: beneficiary });

    const AsureBalance = await token.balanceOf.call(beneficiary);

    expect(Web3.utils.fromWei(AsureBalance)).to.eq('1000');
  });
});
