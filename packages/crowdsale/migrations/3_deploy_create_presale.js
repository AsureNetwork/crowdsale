const moment = require('moment');
const {loadCrowdsaleConfig, saveCrowdsaleConfig} = require('../utils/migrations');
const ctorEncode = require('../utils/ctorEncode');

const AsureCrowdsaleDeployer = artifacts.require("AsureCrowdsaleDeployer");
const AsureCrowdsale = artifacts.require("AsureCrowdsale");
const AsureBounty = artifacts.require("AsureBounty");
const AsureToken = artifacts.require("AsureToken");

module.exports = async function (deployer, network) {
  await deployer;

  const config = loadCrowdsaleConfig(__filename, network);
  const preSaleOpeningTime = moment(config.preSale.opening, config.dateFormat).unix();
  const preSaleBonusTime = moment(config.preSale.bonusTime, config.dateFormat).unix();
  const preSaleClosingTime = moment(config.preSale.closing, config.dateFormat).unix();

  await deployer.deploy(
    AsureCrowdsaleDeployer,
    config.owner,
  );

  config.crowdsaleDeployer = {addr: AsureCrowdsaleDeployer.address};
  config.crowdsaleDeployer.constructorCall = ctorEncode(
    AsureCrowdsaleDeployer.abi,
    config.owner,
  );


  const crowdsaleDeployer = await AsureCrowdsaleDeployer.at(AsureCrowdsaleDeployer.address);
  config.token.addr = await crowdsaleDeployer.token.call();
  config.token.constructorCall = ctorEncode(
    AsureToken.abi,
    config.owner,
  );

  await deployer.deploy(
    AsureBounty,
    config.owner,
    config.token.addr
  );

  config.bounty = {addr: AsureBounty.address};

  config.bounty.constructorCall = ctorEncode(
    AsureBounty.abi,
    config.owner,
    config.token.addr
  );



  const mintTx = await crowdsaleDeployer.mint(
    config.foundationWallet,
    config.bounty.addr,
    config.familyFriendsWallet,
    config.team.map(b => b.addr),
    config.team.map(b => b.amount),
    config.advisor.map(b => b.addr),
    config.advisor.map(b => b.amount),
    {from: config.owner}
  );

  const ethUsdPrice = config.preSale.ethUsdPrice;
  const bonusRate = config.preSale.bonusRate = Math.ceil(ethUsdPrice * (1 / 0.50));
  const defaultRate = config.preSale.defaultRate = Math.ceil(ethUsdPrice * (1 / 0.75));

  const preSaleTx = await crowdsaleDeployer.createPreSale(
    bonusRate,
    preSaleBonusTime,
    defaultRate,
    config.owner,
    config.crowdsaleWallet,
    preSaleOpeningTime,
    preSaleClosingTime,
    {from: config.owner}
  );

  config.preSale.addr = await crowdsaleDeployer.presale.call();
  config.preSale.constructorCall = ctorEncode(
    AsureCrowdsale.abi,
    bonusRate,
    preSaleBonusTime,
    defaultRate,
    config.owner,
    config.crowdsaleWallet,
    config.token.addr,
    preSaleOpeningTime,
    preSaleClosingTime
  );


  saveCrowdsaleConfig(__filename, network, config);

  /*const asureBounty = await AsureBounty.at(AsureBounty.address);
  const dropTx = await asureBounty.drop([
    config.owner,
    config.owner,
    config.owner,
    config.owner,
    config.owner,
    config.owner,
    config.owner,
    config.owner,
    config.owner,
    config.owner],[100,100,100,100,100,100,100,100,100,100],{ from: config.owner });
  */
  console.log('Tx mint gas used', mintTx.receipt.gasUsed);
  console.log('Tx preSale gas used', preSaleTx.receipt.gasUsed);
  //console.log('Tx dropTx gas used', dropTx.receipt.gasUsed);
  console.log(`Asure PreSale deployment successful.`);
};
