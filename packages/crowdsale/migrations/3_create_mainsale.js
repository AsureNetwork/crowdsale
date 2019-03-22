const fs = require('fs');
const path = require('path');
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

  const mainSaleTx = await crowdsaleDeployer.createMainSale(
    200 * (1 / 0.5),         // bonus rate: ETH = 200 USD + 50% bonus
    mainSaleBonusTime,     // bonus time
    200 * (1 / 0.5),         // default rate: ETH = 200 USD + 50% bonus
    config.owner,
    config.crowdsaleWallet,     // wallet
    mainSaleOpeningTime,        // december 2019
    mainSaleClosingTime,
    { from: config.owner }
  );

  config.mainSale.addr = await crowdsaleDeployer.mainsale.call();
  saveCrowdsaleConfig(__filename, network, config);


  console.log('Tx mainSaleTx gas used', mainSaleTx.receipt.gasUsed);
  console.log(`Asure MainSale deployment successful.`);
};

