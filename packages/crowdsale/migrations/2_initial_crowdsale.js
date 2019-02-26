const moment = require('moment');

const RuhrCrowdsaleDeployer = artifacts.require("./RuhrCrowdsaleDeployer.sol");

module.exports = function(deployer, network) {
  let wallet = '0x38D1Ea5E7EA932E83b482F4816F2ee1C61A288c2';
  if (network === 'development') {
    wallet = '0xd7da996cc3c3186b87c5ea23599dec97153bcc21'; // account 4
  }

  const openingTime = moment('2018-10-17 19:00'); //moment(); //
  const closingTime = openingTime.clone().add(2, 'weeks');

  deployer.deploy(
      RuhrCrowdsaleDeployer,
      wallet,
      openingTime.unix(),
      closingTime.unix()
  );
};
