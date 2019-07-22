const moment = require('moment');
const {loadCrowdsaleConfig, saveCrowdsaleConfig} = require('../utils/migrations');

const AsureCrowdsaleDeployer = artifacts.require("AsureCrowdsaleDeployer");

module.exports = async function (deployer, network) {
  await deployer;

  const config = loadCrowdsaleConfig(__filename, network);
  const mainSaleOpeningTime = moment(config.mainSale.opening, config.dateFormat).unix();
  const mainSaleBonusTime = moment(config.mainSale.bonusTime, config.dateFormat).unix();
  const mainSaleClosingTime = moment(config.mainSale.closing, config.dateFormat).unix();

  const crowdsaleDeployer = await AsureCrowdsaleDeployer.at(AsureCrowdsaleDeployer.address);

  const ethUsdPrice = config.mainSale.ethUsdPrice;
  const bonusRate = config.mainSale.bonusRate = Math.ceil(ethUsdPrice * (1 / 0.85));
  const defaultRate = config.mainSale.defaultRate = Math.ceil(ethUsdPrice);

  const mainSaleTx = await crowdsaleDeployer.createMainSale(
    bonusRate,
    mainSaleBonusTime,
    defaultRate,
    config.owner,
    config.crowdsaleWallet,
    mainSaleOpeningTime,
    mainSaleClosingTime,
    { from: config.owner }
  );

  config.mainSale.addr = await crowdsaleDeployer.mainsale.call();
  saveCrowdsaleConfig(__filename, network, config);

  console.log('Tx mainSaleTx gas used', mainSaleTx.receipt.gasUsed);
  console.log(`Asure MainSale deployment successful.`);
};

