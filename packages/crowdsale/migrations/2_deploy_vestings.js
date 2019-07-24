const moment = require('moment');
const {loadCrowdsaleConfig, saveCrowdsaleConfig} = require('../utils/migrations');
const ctorEncode = require('../utils/ctorEncode');

const TokenVesting = artifacts.require("TokenVesting");

module.exports = async function (deployer, network) {
  await deployer;

  const config = loadCrowdsaleConfig(__filename, network);
  const mainSaleOpeningTime = moment(config.mainSale.opening, config.dateFormat).unix();

  for (let i = 0; i < config.team.length; i++) {
    await createVestingContract(deployer, config.team[i], mainSaleOpeningTime);
  }
  for (let i = 0; i < config.advisor.length; i++) {
    await createVestingContract(deployer, config.advisor[i], mainSaleOpeningTime);
  }

  saveCrowdsaleConfig(__filename, network, config);

  console.log(`Asure TokenVesting contracts deployment successful.`);
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

  beneficiary.constructorCall = ctorEncode(
    TokenVesting.abi,
    beneficiary.owner,
    mainSaleOpeningTime,
    0,
    twoYearsInSeconds,
    false
  );
  beneficiary.addr = TokenVesting.address;
  console.log(`${beneficiary.idx} token-vesting > owner (amount)  : ${beneficiary.addr} > ${beneficiary.owner} (${beneficiary.amount})`);
}
