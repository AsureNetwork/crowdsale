const fs = require('fs');
const path = require('path');

function loadCrowdsaleConfig(migration, network) {
  migration = path.basename(migration).charAt(0);

  const fileName = `crowdsale-${network}-${migration}.json`;

  if (!fs.existsSync(path.join(process.cwd(), fileName))) {
    throw Error(
      `No crowdsale configuration file (${path.join(process.cwd(), fileName)}) for network "${network}" found.`
    )
  }

  return require(`../${fileName}`);
}

function saveCrowdsaleConfig(migration, network, config) {
  migration = Number(path.basename(migration).charAt(0)) + 1;
  const fileName = `crowdsale-${network}-${migration}.json`;

  fs.writeFileSync(fileName, JSON.stringify(config, null, 2));
}

module.exports = {loadCrowdsaleConfig, saveCrowdsaleConfig};
