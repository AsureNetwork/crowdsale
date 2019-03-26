const Web3 = require('web3');
const moment = require('moment');

function send(method, params = []) {
  const jsonrpc = '2.0';
  const id = 0;

  return new Promise((resolve, reject) => {
    web3.currentProvider.send({id, jsonrpc, method, params}, (err, result) => {
      // TODO: Find correct usage of callback arguments
      if (result.error) {
        reject(result.data)
      } else {
        resolve(result.result);
      }
    });
  });
}

function isolateTests(tests) {
  describe('isolated tests (using snapshot / revert)', () => {
    let snapshotId;

    beforeEach(async () => {
      snapshotId = Web3.utils.hexToNumber(await send('evm_snapshot'));
    });

    afterEach(async () => {
      await send('evm_revert', [snapshotId]);
    });

    tests();
  });
}

const initialBlocktime = moment('2019-07-22T22:00:00.000Z');

module.exports = {send, isolateTests, initialBlocktime};
