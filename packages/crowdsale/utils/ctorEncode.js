const web3Abi = require('web3-eth-abi');


module.exports = function ctorEncode(abi, ...args) {
  const ctorAbi = abi.find(t => t.type === 'constructor');

  return {
    encoded: web3Abi.encodeFunctionCall(ctorAbi, args).substr(10),
    decoded: args,
  };
};
