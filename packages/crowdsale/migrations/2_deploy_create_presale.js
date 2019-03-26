const moment = require('moment');
const {loadCrowdsaleConfig, saveCrowdsaleConfig} = require('../utils/migrations');

const AsureCrowdsaleDeployer = artifacts.require("AsureCrowdsaleDeployer");
const TokenVesting = artifacts.require("TokenVesting");
const AsureBounty = artifacts.require("AsureBounty");

module.exports = async function (deployer, network) {
  await deployer;

  const config = loadCrowdsaleConfig(__filename, network);
  const preSaleOpeningTime = moment(config.preSale.opening, config.dateFormat).unix();
  const preSaleBonusTime = moment(config.preSale.bonusTime, config.dateFormat).unix();
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
  config.token.addr = await crowdsaleDeployer.token.call();

  await deployer.deploy(
    AsureBounty,
    config.owner,
    config.token.addr
  );

  const mintTx = await crowdsaleDeployer.mint(
    config.foundationWallet,
    AsureBounty.address,
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


async function createVestingContract(deployer, beneficiary, mainSaleOpeningTime) {
  const twoYearsInSeconds = moment.duration().add(2, 'years').asSeconds();

  await deployer.deploy(
    TokenVesting,
    beneficiary.owner,   // address
    mainSaleOpeningTime, // unix timestemp
    0,                   // cliffDuration
    twoYearsInSeconds,   // duration in seconds
    false                // bool revocable
  );

  beneficiary.addr = TokenVesting.address;
  console.log(`token-vesting > owner (amount)  : ${beneficiary.addr} > ${beneficiary.owner} (${beneficiary.amount})`);
}
