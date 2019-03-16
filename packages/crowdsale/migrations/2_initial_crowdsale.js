const moment = require('moment');

const AsureCrowdsaleDeployer = artifacts.require("./AsureCrowdsaleDeployer.sol");
const TokenVesting = artifacts.require("TokenVesting");


module.exports = async function (deployer, network) {
  let owner = '0x38D1Ea5E7EA932E83b482F4816F2ee1C61A288c2';
  if (network === 'development') {
    owner = '0xd7da996cc3c3186b87c5ea23599dec97153bcc21'; // account 4
  }
  const twoyears = 63072000; // ~2 yr = 60*60*24*365*2
  const dateFormat = "YYYY-MM-DD HH:mm";
  const preSaleOpeningTime = moment('2019-08-01 00:00', dateFormat);
  const preSaleClosingTime = moment('2019-08-15 00:00', dateFormat);

  const mainSaleOpeningTime = moment('2019-12-1 00:00', dateFormat);
  const mainSaleClosingTime = moment('2019-12-31 00:00', dateFormat);

  //Team
  const teamBeneficiaries = [
    {
      _addr: '0xcbBc3D3d381f3A9a48CbAE9Ca701aC3c92e0aEA5',
      _amount: 1,
      _tokenVestingAddr: null
    },
    {
      _addr: '0xcbBc3D3d381f3A9a48CbAE9Ca701aC3c92e0aEA5',
      _amount: 1,
      _tokenVestingAddr: null
    }
  ];

  for (let i = 0; i < teamBeneficiaries.length; i++) {
    const instance = await deployer.deploy(
      TokenVesting,
      teamBeneficiaries[i]._addr, //address
      mainSaleOpeningTime.unix(), //unix timestemp
      0, //cliffDuration
      twoyears, // duration in sec ~2 yr = 60*60*24*365*2
      false // bool revocable
    );
    //console.log("instance: ", instance);
    teamBeneficiaries[i]._tokenVestingAddr = TokenVesting.address;
    console.log("teamBeneficiaries[i]._tokenVestingAddr:" + teamBeneficiaries[i]._tokenVestingAddr);
  }

  //Advisor
  const advisorBeneficiaries = [
    {
      _addr: '0xcbBc3D3d381f3A9a48CbAE9Ca701aC3c92e0aEA5',
      _amount: 1,
      _tokenVestingAddr: null
    },
    {
      _addr: '0xcbBc3D3d381f3A9a48CbAE9Ca701aC3c92e0aEA5',
      _amount: 1,
      _tokenVestingAddr: null
    }
  ];

  for (let i = 0; i < advisorBeneficiaries.length; i++) {
    const instance = await deployer.deploy(
      TokenVesting,
      advisorBeneficiaries[i]._addr, //address
      mainSaleOpeningTime.unix(), //unix timestemp
      0, //cliffDuration
      twoyears, // duration in sec ~2 yr = 60*60*24*365*2
      false // bool revocable
    );

    //console.log("instance: ", instance);
    advisorBeneficiaries[i]._tokenVestingAddr = TokenVesting.address;
    console.log("advisorBeneficiaries[i]._tokenVestingAddr:" + advisorBeneficiaries[i]._tokenVestingAddr);
  }

  //AsureCrowdsale
  await deployer.deploy(
    AsureCrowdsaleDeployer,
    owner,
    preSaleOpeningTime.unix(),
    preSaleClosingTime.unix(),
    mainSaleOpeningTime.unix(),
    mainSaleClosingTime.unix(),
    teamBeneficiaries.map(b => b._tokenVestingAddr),
    teamBeneficiaries.map(b => b._amount),
    advisorBeneficiaries.map(b => b._tokenVestingAddr),
    advisorBeneficiaries.map(b => b._amount),
  );
};

/*
const oneyear = 31536000 // ~1 yr = 60*60*24*365
const twoyears = 63072000 // ~2 yr = 60*60*24*365*2
const threeyears = 94608000 // ~3 yr = 60*60*24*365*3
const fouryears = 126144000 // ~4yrs =60*60*24*365*4
*/
