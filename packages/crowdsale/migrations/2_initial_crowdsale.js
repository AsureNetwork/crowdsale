const fs = require('fs');
const path = require('path');
const moment = require('moment');

const AsureCrowdsaleDeployer = artifacts.require("AsureCrowdsaleDeployer");
const TokenVesting = artifacts.require("TokenVesting");

module.exports = async function (deployer, network) {
  await deployer;

  const config = loadCrowdsaleConfig(network);
  const preSaleOpeningTime = moment(config.preSale.opening, config.dateFormat).unix();
  const preSaleClosingTime = moment(config.preSale.closing, config.dateFormat).unix();
  const mainSaleOpeningTime = moment(config.mainSale.opening, config.dateFormat).unix();
  const mainSaleClosingTime = moment(config.mainSale.closing, config.dateFormat).unix();

  for (let i = 0; i < config.team.length; i++) {
    await createVestingContract(config.team[i], mainSaleOpeningTime);
  }
  for (let i = 0; i < config.advisor.length; i++) {
    await createVestingContract(config.advisor[i], mainSaleOpeningTime);
  }

  const crowdsaleDeployer = await AsureCrowdsaleDeployer.new(
    200 * (1 / 0.5), // ETH = 200 USD + 50% bonus
    config.owner,
    config.crowdsaleWallet, //wallet
    config.foundationWallet, //foundationWallet
    config.bountyWallet, //bountyWallet
    config.familyFriendsWallet, //familyFriendsWallet
    preSaleOpeningTime,
    preSaleClosingTime,
    mainSaleOpeningTime,
    mainSaleClosingTime,
    config.team.map(b => b.addr),
    config.team.map(b => b.amount),
    config.advisor.map(b => b.addr),
    config.advisor.map(b => b.amount),
  );

  config.token.addr = await crowdsaleDeployer.token.call();
  config.preSale.addr = await crowdsaleDeployer.presale.call();
  config.mainSale.addr = await crowdsaleDeployer.mainsale.call();

  console.log(`config.token.addr               : ${config.token.addr}`);
  console.log(`config.preSale.addr             : ${config.preSale.addr}`);
  console.log(`config.mainSale.addr            : ${config.mainSale.addr}`);

  console.log(`AsureCrowdsale deployment successful.`);
  fs.writeFileSync(`crowdsale-${network}-final.json`, JSON.stringify(config, null, 2));
};


async function createVestingContract(beneficiary, mainSaleOpeningTime) {
  const twoYearsInSeconds = 63072000; // ~2 yr = 60*60*24*365*2

  const instance = await TokenVesting.new(
    beneficiary.owner,   // address
    mainSaleOpeningTime, // unix timestemp
    0,                   // cliffDuration
    twoYearsInSeconds,   // duration in sec ~2 yr = 60*60*24*365*2
    false                // bool revocable
  );
  beneficiary.addr = instance.address;
  console.log(`token-vesting > owner (amount)  : ${beneficiary.addr} > ${beneficiary.owner} (${beneficiary.amount})`);
}

function loadCrowdsaleConfig(network) {
  const fileName = `crowdsale-${network}.json`;

  if (!fs.existsSync(path.join(process.cwd(), fileName))) {
    throw Error(
      `No crowdsale configuration file (${path.join(process.cwd(), fileName)}) for network "${network}" found.`
    )
  }

  return require(`../${fileName}`);
}
