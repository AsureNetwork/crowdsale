const Web3 = require('web3');
const moment = require('moment');
const {time} = require('openzeppelin-test-helpers');

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

function isolateAllTests(tests) {
  describe('isolated all tests (using snapshot / revert)', () => {
    let snapshotId;

    before(async () => {
      snapshotId = Web3.utils.hexToNumber(await send('evm_snapshot'));
    });

    after(async () => {
      await send('evm_revert', [snapshotId]);
    });

    tests();
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

/**
 * Advances the blocktime to the specified moment date.
 * @param to Moment The moment date.
 */
async function advanceBlocktime(to) {
  await time.advanceBlock();
  const from = moment.unix(await time.latest());
  const diff = moment.duration(to.diff(from));

  //console.log(`advanceBlocktime: from ${from.unix()}, to ${to.unix()}, diff ${diff.asSeconds()}`);

  await time.increase(diff.asSeconds());
}

const initialBlocktime = moment('2019-07-22T22:00:00.000Z');

// always revert to initial snapshot created by the ganache script.
// This way, we can leave ganach running while running tests and integrations tests
// multiple time
// (async () => {
//   await send('evm_revert', [1]);
// })();

module.exports = {send, isolateTests, isolateAllTests, initialBlocktime, advanceBlocktime};
