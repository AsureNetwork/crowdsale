const moment = require('moment');

const RuhrCrowdsaleDeployer = artifacts.require("./RuhrCrowdsaleDeployer.sol");

module.exports = function(deployer, network) {
  let wallet = '0x38D1Ea5E7EA932E83b482F4816F2ee1C61A288c2';
  if (network === 'development') {
    wallet = '0xd7da996cc3c3186b87c5ea23599dec97153bcc21'; // account 4
  }

  const openingTime = moment('2019-08-01 00:00'); //moment(); //
  const closingTime = moment('2019-12-31 00:00');

  deployer.deploy(
      RuhrCrowdsaleDeployer,
      wallet,
      openingTime.unix(),
      closingTime.unix()
  );
};
