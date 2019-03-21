module.exports = {
  port: 8555,
  testrpcOptions: '-p 8555 --mnemonic "flight cute ski coffee decide milk bitter table speed orchard bag meadow"',
  testCommand: 'mocha --timeout 5000',
  norpc: true,
  dir: '.',
  copyPackages: ['openzeppelin-solidity'],
  skipFiles: ['test/TestToken.sol','test/TestAsureBonusesCrowdsale.sol']
};
