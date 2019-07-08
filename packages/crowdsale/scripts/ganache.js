#!/usr/bin/env node

// https://github.com/etherisc/tokensale/blob/master/bin/ganache.js
// "ganache": "ganache-cli --networkId 17101710 --time '02-20-2019' --mnemonic \"flight cute ski coffee decide milk bitter table speed orchard bag meadow\"",

const util = require('util');
const path = require('path');
const exec = util.promisify(require('child_process').exec);
const Ganache = require('ganache-cli');
const moment = require('moment');
const log = require('../utils/logger');

const initialBlocktime = moment('2019-07-22T22:00:00.000Z');

const options = {
  port: 8545,
  network_id: 1234567890,
  mnemonic: "flight cute ski coffee decide milk bitter table speed orchard bag meadow",
  time: initialBlocktime.toDate(),
  // debug: true,
  logger: {log: log.info},
  blocktime: 0,
  // gasPrice: 1,
  gasLimit: 6900000,
  vmErrorsOnRPCResponse: true,
  total_accounts: 200,
  default_balance_ether: 9999999
};

const server = Ganache.server(options);

const getUseCase = secretKey => {
  const acc = options.accounts.find(a => a.secretKey === `0x${secretKey}`);
  return acc ? acc.usecase : 'null';
};

server.listen(options.port, async (err, result) => {
  if (err) {
    log.error(err);
  } else {
    const state = result || server.provider.manager.state;
    log.info('EthereumJS TestRPC');
    log.info("gasPrice: " + options.gasPrice);
    log.info("gasLimit: " + options.gasLimit);
    log.info("time: " + initialBlocktime.toISOString());
    log.info('Accounts:');
    Object.keys(state.accounts).forEach((address, index) => {
      const secretKey = state.accounts[address].secretKey.toString('hex');
      log.info(
        `(${index}) ${address}${
          state.isUnlocked(address) === false ? ' ðŸ”’' : ''
          }, pKey: ${secretKey}`
      );
    });

    // server.provider.send({id: 0, jsonrpc: '2.0', method: 'evm_snapshot', params: []}, (err, result) => {
    //   if (result.error) {
    //     log.error('Failed to create snapshot #1');
    //     process.exit(1);
    //   } else {
    log.info(`Listening on ${options.hostname || 'localhost'}:${options.port}`);
    log.info(`Started successfully`);
    //   }
    // });
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

