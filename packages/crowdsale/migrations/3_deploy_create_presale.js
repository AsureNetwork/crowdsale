const moment = require('moment');
const {loadCrowdsaleConfig, saveCrowdsaleConfig} = require('../utils/migrations');

const AsureCrowdsaleDeployer = artifacts.require("AsureCrowdsaleDeployer");
const AsureBounty = artifacts.require("AsureBounty");

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
  const crowdsaleDeployer = await AsureCrowdsaleDeployer.at(AsureCrowdsaleDeployer.address);
  config.token.addr = await crowdsaleDeployer.token.call();

  await deployer.deploy(
    AsureBounty,
    config.owner,
    config.token.addr
  );
  config.bountyAddr = AsureBounty.address;

  const mintTx = await crowdsaleDeployer.mint(
    config.foundationWallet,
    config.bountyAddr,
    config.familyFriendsWallet,
    config.team.map(b => b.addr),
    config.team.map(b => b.amount),
    config.advisor.map(b => b.addr),
    config.advisor.map(b => b.amount),
    { from: config.owner }
  );

  const ethUsdPrice = config.preSale.ethUsdPrice;
  const bonusRate = Math.ceil(ethUsdPrice * (1 / 0.50));
  const defaultRate = Math.ceil(ethUsdPrice * (1 / 0.75));

  const preSaleTx = await crowdsaleDeployer.createPreSale(
    bonusRate,
    preSaleBonusTime,
    defaultRate,
    config.owner,
    config.crowdsaleWallet,
    preSaleOpeningTime,
    preSaleClosingTime,
    { from: config.owner }
  );

  config.preSale.addr = await crowdsaleDeployer.presale.call();
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
