# Asure.Network Token Generation Event Contracts

Here be smart contracts for the [Asure token][asure token].

![Asure Token](asure.network.png)

Asure is a utility token built on top of the [Ethereum][ethereum] blockchain.
Asure provides a scalable blockchain network for decentralized social security 
built around openness, privacy, and fairness, and brings together individuals, 
companies and governments in a digital world.

## Contracts

Please see the [contracts](packages/crowdsale/contracts/) directory.

## Develop

Contracts are written in [Solidity][solidity] and tested using [Truffle][truffle] and [Ganache][ganache].

### Depenencies

```bash
$ npm i
# Install Truffle and testrpc packages globally:
$ npm install -g truffle

# Install local node dependencies:
$ npm install

# Bootstrap:
$ lerna bootstrap

# Run ganache:
$ lerna bootstrap
```

### Test

```bash
# This will compile and test the contracts using truffle
$ cd packages\crowdsale
$ truffle test
```



## Ethereum Testnet

All demos are deployed to the rinkeby testnet by the 
account [0x38D1Ea5E7EA932E83b482F4816F2ee1C61A288c2](https://rinkeby.etherscan.io/address/0x38d1ea5e7ea932e83b482f4816f2ee1c61a288c2).

- [rinkeby testnet](https://www.rinkeby.io)
- [rinkeby faucet](https://faucet.rinkeby.io/)
- [rinkeby etherscan.io](https://rinkeby.etherscan.io/address/0x38d1ea5e7ea932e83b482f4816f2ee1c61a288c2)

## Demo Greeter

- [rinkeby contract](https://rinkeby.etherscan.io/address/0xb91a3777701a8fbcbd93171ff1aed77a972a1ae8)

## Demo Crowdsale

- [rinkeby AsureCrowdsaleDeployer](https://rinkeby.etherscan.io/address/0x5662337827c8f0E5D0dabD780A508354670AbAFe)
- [rinkeby AsureToken](https://rinkeby.etherscan.io/address/0x4CA1f43F010F3bF9faBaBA641c4847A3dE4Bd846)
- [rinkeby AsureCrowdsale](https://rinkeby.etherscan.io/address/0x848970E1b36d7BDE2375EbE6C556e48b030f9025)


[asure token]: https://asure.network
[ethereum]: https://www.ethereum.org/

[solidity]: https://solidity.readthedocs.io/en/develop/
[truffle]: http://truffleframework.com/
[ganache]: https://truffleframework.com/ganache
