#!/usr/bin/env node

// https://github.com/etherisc/tokensale/blob/master/bin/ganache.js
// "ganache": "ganache-cli --networkId 17101710 --time '02-20-2019' --mnemonic \"flight cute ski coffee decide milk bitter table speed orchard bag meadow\"",

const util = require('util');
const path = require('path');
const exec = util.promisify(require('child_process').exec);
const Ganache = require('ganache-cli');
const log = require('../utils/logger');
const now = new Date();

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const options = {
  port: 8545,
  network_id: 1234567890,
  mnemonic: "flight cute ski coffee decide milk bitter table speed orchard bag meadow",
  time: now, /*ISO 8601*/
  // debug: true,
  logger: {log: log.info},
  blocktime: 0,
  gasPrice: 1,
  gasLimit: 0xfffffffffff,
  vmErrorsOnRPCResponse: true
};

const server = Ganache.server(options);

// const getUseCase = secretKey => {
//   const acc = options.accounts.find(a => a.secretKey === `0x${secretKey}`);
//   return acc ? acc.usecase : 'null';
// };

server.listen(options.port, async (err, result) => {
  if (err) {
    log.error(err);
  } else {
    const state = result || server.provider.manager.state;
    log.info('EthereumJS TestRPC');
    log.info("gasPrice: " + options.gasPrice);
    log.info("gasLimit: " + options.gasLimit);
    // log.info('Accounts:');
    // Object.keys(state.accounts).forEach((address, index) => {
    //   const secretKey = state.accounts[address].secretKey.toString('hex');
    //   log.info(
    //     `(${index}) ${address}${
    //       state.isUnlocked(address) === false ? ' ðŸ”’' : ''
    //       }, pKey: ${secretKey}, ${getUseCase(secretKey)}`
    //   );
    // });

    log.info(`Listening on ${options.hostname || 'localhost'}:${options.port}`);

    try {
      /*      if (process.argv.includes('--migrate')) {
              log.info('Deploying smart contracts ...');
              await exec('npm run migrate-dev');
              log.info('Deployment of smart contracts was successful.');
            }

            if (process.argv.includes('--deploy-test-data')) {
              log.info('Deploying test data. This will take a few minutes ...');
              await delay(2500);
              await await exec('npm run deploy-dev', {
                cwd: path.resolve(__dirname, '../../gpcli')
              });
              log.info('Deployment of test data was successful');
            }*/

      log.info(`Started successfully`);
    } catch (error) {
      log.error(error);
      process.exit(1);
    }
  }
});

process.on('uncaughtException', error => {
  log.error(error.stack);
  process.exit(1);
});

// See http://stackoverflow.com/questions/10021373/what-is-the-windows-equivalent-of-process-onsigint-in-node-js
if (process.platform === 'win32') {
  require('readline')
    .createInterface({
      input: process.stdin,
      output: process.stdout
    })
    .on('SIGINT', () => {
      process.emit('SIGINT');
    });
}

process.on('SIGINT', () => {
  // graceful shutdown
  server.close(error => {
    if (error) {
      log.error(error.stack || error);
    }
    process.exit();
  });
});

