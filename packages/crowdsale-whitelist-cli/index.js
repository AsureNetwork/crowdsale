const fs = require('fs');
const path = require('path');
const ethers = require('ethers');
const _ = require('lodash');

function createAsureTokenContract(provider) {
  var abi = [
    {
      "constant": false,
      "inputs": [
        {
          "name": "account",
          "type": "address"
        }
      ],
      "name": "addWhitelisted",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "hasClosed",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "defaultRate",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "account",
          "type": "address"
        }
      ],
      "name": "removeWhitelisted",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "rate",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "account",
          "type": "address"
        }
      ],
      "name": "isWhitelisted",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "weiRaised",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "isOpen",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "closingTime",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [],
      "name": "renounceWhitelistAdmin",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "wallet",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "bonusRate",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "account",
          "type": "address"
        }
      ],
      "name": "addWhitelistAdmin",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "isOwner",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "openingTime",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "bonusTime",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "account",
          "type": "address"
        }
      ],
      "name": "isWhitelistAdmin",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "newBonusRate",
          "type": "uint256"
        },
        {
          "name": "newBonusTime",
          "type": "uint256"
        },
        {
          "name": "newDefaultRate",
          "type": "uint256"
        }
      ],
      "name": "updateRates",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [],
      "name": "renounceWhitelisted",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "beneficiary",
          "type": "address"
        }
      ],
      "name": "buyTokens",
      "outputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "getCurrentRate",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "token",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "name": "bonusRate",
          "type": "uint256"
        },
        {
          "name": "bonusTime",
          "type": "uint256"
        },
        {
          "name": "defaultRate",
          "type": "uint256"
        },
        {
          "name": "owner",
          "type": "address"
        },
        {
          "name": "wallet",
          "type": "address"
        },
        {
          "name": "token",
          "type": "address"
        },
        {
          "name": "openingTime",
          "type": "uint256"
        },
        {
          "name": "closingTime",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "payable": true,
      "stateMutability": "payable",
      "type": "fallback"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "bonusRate",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "bonusTime",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "defaultRate",
          "type": "uint256"
        }
      ],
      "name": "RatesUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "purchaser",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "beneficiary",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "value",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "TokensPurchased",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "account",
          "type": "address"
        }
      ],
      "name": "WhitelistedAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "account",
          "type": "address"
        }
      ],
      "name": "WhitelistedRemoved",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "account",
          "type": "address"
        }
      ],
      "name": "WhitelistAdminAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "account",
          "type": "address"
        }
      ],
      "name": "WhitelistAdminRemoved",
      "type": "event"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "accounts",
          "type": "address[]"
        }
      ],
      "name": "addWhitelistedAccounts",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [],
      "name": "burn",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "to",
          "type": "address"
        },
        {
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transferToIEO",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
  var address = '0xC099567A3f3cb3975B6D9B4C9Ff6A1e342C14C63';

  return new ethers.Contract(address, abi, provider);
}

async function splitInWhitelistedAndNotWhitelisted(addresses, crowdsale) {
  const result = {
    isWhitelisted: [],
    isNotWhitelisted: []
  };

  for (let addr of addresses) {
    const isWhitelisted = await crowdsale.isWhitelisted(addr);
    if(isWhitelisted) {
      result.isWhitelisted.push(addr);
    } else {
      result.isNotWhitelisted.push(addr);
    }
  }

  return result;
}

async function whitelistAccounts(addresses, crowdsale, provider) {
  if (addresses.length === 0) {
    return;
  }

  if(!process.env.hasOwnProperty('MNEMONIC')) {
    console.error('MNEMONIC not set in env');
    process.exit(2);
  }

  const wallet = new ethers.Wallet.fromMnemonic(process.env.MNEMONIC).connect(provider);
  const crowdsaleWithSigner = crowdsale.connect(wallet);

  const addressChunks = _.chunk(addresses, 10);
  for (let addressChunk of addressChunks) {
    const tx = await crowdsaleWithSigner.addWhitelistedAccounts(addressChunk, {
      gasLimit: 7500000,
      gasPrice: ethers.utils.parseUnits('10.0', 'gwei'),
    });
    await tx.wait();
  }
}

function parseAddresses() {
  const addresses = fs
    .readFileSync('./addresses.txt', 'utf-8')
    .split('\n')
    .filter(a => a.startsWith('0x'));

  return _.uniq(addresses).map(a => ethers.utils.getAddress(a));
}

async function start() {
  const addresses = parseAddresses();

  const provider = new ethers.providers.JsonRpcProvider("https://cloudflare-eth.com/");
  const crowdsale = createAsureTokenContract(provider);

  const whitelistedResult = await splitInWhitelistedAndNotWhitelisted(addresses, crowdsale);

  console.log('Following addresses are already whitelisted:');
  whitelistedResult.isWhitelisted.forEach(a => console.log(a));
  console.log();

  if (whitelistedResult.isNotWhitelisted.length === 0) {
    console.log('All addresses are already whitelisted.');
  } else {
    console.log('Trying to whitelist the following addresses:');
    whitelistedResult.isNotWhitelisted.forEach(a => console.log(a));
    await whitelistAccounts(whitelistedResult.isNotWhitelisted, crowdsale, provider);
    console.log('All addresses are whitelisted.');
  }
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
