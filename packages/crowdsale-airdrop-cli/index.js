const fs = require('fs');
const path = require('path');
const ethers = require('ethers');
const _ = require('lodash');
const peepethJson = require("./peepeth.output.json");

function createAsureBountyContract(provider) {
  var abi = [
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
          "name": "owner",
          "type": "address"
        },
        {
          "name": "tokenAddr",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "constructor"
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
      "constant": false,
      "inputs": [
        {
          "name": "recipients",
          "type": "address[]"
        },
        {
          "name": "values",
          "type": "uint256[]"
        }
      ],
      "name": "drop",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "recipients",
          "type": "address[]"
        }
      ],
      "name": "airdrop",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
  var address = '0x82E367A172bE91Cc44F0d016F26135D319fe0394';

  return new ethers.Contract(address, abi, provider);
}

/*
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
}*/

function getNextChunk(num) {
  let result = [];
  let index = 0;
  for (let item of peepethJson) {
    if (!item.airdroped && ethers.utils.bigNumberify(item.balance).gt(ethers.utils.bigNumberify(ethers.utils.parseEther('0.5')))) {
      result.push(item);
      index++;
      if (index >= num) {
        break;
      }
    }
  }
  return result;
}

async function airdrop(contract, provider) {
  const mnemonic = process.env.MNEMONIC;

  if (!mnemonic) {
    console.error('MNEMONIC not set in env');
    process.exit(2);
  }

  const wallet = new ethers.Wallet.fromMnemonic(mnemonic).connect(provider);
  const contractConnected = contract.connect(wallet);

  let items=[];
  do {
    try {
      items = getNextChunk(100);
      console.log('Following addresses are already whitelisted:');
      items.forEach(a => console.log(a));

      let addressChunk = items.map((elem)=> elem.address);
      const tx = await contractConnected.airdrop(addressChunk, {
        gasLimit: 7500000,
        gasPrice: ethers.utils.parseUnits('10.0', 'gwei'),
      });
      console.log(tx.hash);
      await tx.wait();
      for (let item of items){
        item.airdroped = true;
      }
      fs.writeFile('peepeth.output.json', JSON.stringify(peepethJson), 'utf8', function (error) {
        if (error) {
          console.error("Write error:  " + error.message);
        } else {
          console.log("Successful Write to peepeth.output.json");
        }
      });
    }
    catch (ex) {
      console.error("Exception", ex);
      process.exit(1);
    }
  } while (items.length > 0)
}

/*
async function whitelistAccounts(addresses, crowdsale, provider) {
  if (addresses.length === 0) {
    return;
  }

  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic) {
    console.error('MNEMONIC not set in env');
    process.exit(2);
  }

  const wallet = new ethers.Wallet.fromMnemonic(mnemonic).connect(provider);
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
*/
/*function parseAddresses() {
  const addresses = fs
    .readFileSync('./addresses.txt', 'utf-8')
    .split('\n')
    .filter(a => a.startsWith('0x'));

  return _.uniq(addresses).map(a => ethers.utils.getAddress(a));
}*/

async function start() {
  //const addresses = parseAddresses();

  const provider = new ethers.providers.JsonRpcProvider("https://cloudflare-eth.com/");
  const contract = createAsureBountyContract(provider);

  await airdrop(contract, provider);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
