module.exports = {
  port: 8555,
  testrpcOptions: '-p 8555 --mnemonic "flight cute ski coffee decide milk bitter table speed orchard bag meadow"',
  //norpc: true,
  dir: '.',
  copyPackages: ['openzeppelin-solidity'],
  skipFiles: ['test/TestToken.sol','test/TestAsureBonusesCrowdsale.sol'],
  compileCommand: '../node_modules/.bin/truffle compile',
  testCommand: '../node_modules/.bin/truffle test --network coverage',
};
