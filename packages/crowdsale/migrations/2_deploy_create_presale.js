const fs = require('fs');
const moment = require('moment');
const {loadCrowdsaleConfig, saveCrowdsaleConfig} = require('../utils/migrations');

const AsureCrowdsaleDeployer = artifacts.require("AsureCrowdsaleDeployer");
const TokenVesting = artifacts.require("TokenVesting");

module.exports = async function (deployer, network) {
  await deployer;

  const config = loadCrowdsaleConfig(__filename, network);
  const preSaleOpeningTime = moment(config.preSale.opening, config.dateFormat).unix();
  const preSaleClosingTime = moment(config.preSale.closing, config.dateFormat).unix();
  const mainSaleOpeningTime = moment(config.mainSale.opening, config.dateFormat).unix();

  for (let i = 0; i < config.team.length; i++) {
    await createVestingContract(deployer, config.team[i], mainSaleOpeningTime);
  }
  for (let i = 0; i < config.advisor.length; i++) {
    await createVestingContract(deployer, config.advisor[i], mainSaleOpeningTime);
  }

  await deployer.deploy(
    AsureCrowdsaleDeployer,
    config.owner,
  );
  const crowdsaleDeployer = await AsureCrowdsaleDeployer.at(AsureCrowdsaleDeployer.address);

  const mintTx = await crowdsaleDeployer.mint(
    config.foundationWallet,    // foundationWallet
    config.bountyWallet,        // bountyWallet
    config.familyFriendsWallet, // familyFriendsWallet
    config.team.map(b => b.addr),
    config.team.map(b => b.amount),
    config.advisor.map(b => b.addr),
    config.advisor.map(b => b.amount),
    { from: config.owner }
  );

  const preSaleTx = await crowdsaleDeployer.createPreSale(
    200 * (1 / 0.5),         // initial rate: ETH = 200 USD + 50% bonus
    200 * (1 / 0.5),         // bonus rate: ETH = 200 USD + 50% bonus
    preSaleOpeningTime,      // bonus time
    config.owner,
    config.crowdsaleWallet,     // wallet
    preSaleOpeningTime,         // august 2019
    preSaleClosingTime,
    { from: config.owner }
  );

  config.token.addr = await crowdsaleDeployer.token.call();
  config.preSale.addr = await crowdsaleDeployer.presale.call();
  saveCrowdsaleConfig(__filename, network, config);

  console.log('Tx mint gas used', mintTx.receipt.gasUsed);
  console.log('Tx preSale gas used', preSaleTx.receipt.gasUsed);
  console.log(`Asure PreSale deployment successful.`);
};


async function createVestingContract(deployer, beneficiary, mainSaleOpeningTime) {
  const twoYearsInSeconds = 63072000; // ~2 yr = 60*60*24*365*2

  await deployer.deploy(
    TokenVesting,
    beneficiary.owner,   // address
    mainSaleOpeningTime, // unix timestemp
    0,                   // cliffDuration
    twoYearsInSeconds,   // duration in sec ~2 yr = 60*60*24*365*2
    false                // bool revocable
  );

  beneficiary.addr = TokenVesting.address;
  console.log(`token-vesting > owner (amount)  : ${beneficiary.addr} > ${beneficiary.owner} (${beneficiary.amount})`);
}
