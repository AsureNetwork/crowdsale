const moment = require('moment');
const Web3 = require('web3');

const RuhrToken = artifacts.require('RuhrToken');
const RuhrCrowdsale = artifacts.require('RuhrCrowdsale');
const RuhrCrowdsaleDeployer = artifacts.require('RuhrCrowdsaleDeployer');

contract('RuhrCrowdsaleDeployer', async accounts => {
  const owner = accounts[0];
  const wallet = accounts[0];
  const maxCap = String(40 * 10 ** 6);
  const openingTime = moment();
  const closingTime = openingTime.clone().add(2, 'weeks');

  let token, crowdsale;

  it('should instantiate RuhrToken and RuhrCrowdsale', async () => {
    const deployer = await RuhrCrowdsaleDeployer.new(
      wallet,
      openingTime.unix(),
      closingTime.unix()
    );

    const tokenAddress = await deployer.token.call();
    const crowdsaleAddress = await deployer.crowdsale.call();

    token = await RuhrToken.at(tokenAddress);
    crowdsale = await RuhrCrowdsale.at(crowdsaleAddress);

    expect(token).to.be.an.instanceof(RuhrToken);
    expect(crowdsale).to.be.an.instanceof(RuhrCrowdsale);
  });

  it('should instantiate RuhrToken correctly', async () => {
    const tokenName = await token.name.call();
    const tokenSymbol = await token.symbol.call();
    const tokenDecimals = await token.decimals.call();
    const tokenTotalSupply = await token.totalSupply.call();
    const balanceOfCrowdsale = await token.balanceOf.call(crowdsale.address);

    expect(tokenName).to.eq('RuhrToken');
    expect(tokenSymbol).to.eq('RUHR');
    expect(tokenDecimals.toNumber()).to.eq(18);
    expect(Web3.utils.fromWei(tokenTotalSupply)).to.eq(maxCap);
    expect(Web3.utils.fromWei(balanceOfCrowdsale)).to.eq(maxCap);
  });

  it('should instantiate RuhrCrowdsale correctly', async () => {
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

  it('should buy RUHR tokens for 1 ETH', async () => {
    const beneficiary = accounts[2];
    const ethValue = Web3.utils.toWei('1');

    await crowdsale
      .buyTokens
      .sendTransaction(beneficiary, { value: ethValue, from: beneficiary });

    const ruhrBalance = await token.balanceOf.call(beneficiary);

    expect(Web3.utils.fromWei(ruhrBalance)).to.eq('1000');
  });
});
