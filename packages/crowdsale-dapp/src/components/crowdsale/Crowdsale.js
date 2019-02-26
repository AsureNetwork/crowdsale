import React, { Component } from 'react';
import Web3 from 'web3';
import moment from 'moment';
import './Crowdsale.css';
import { CrowdsaleContractInfo } from './CrowdsaleContractInfo';
import { ClosingCountdown } from './ClosingCountdown';
import { TokenDistributionCounter } from './TokenDistributionCounter';
import { Register } from './Register';
import { CheckRegistration } from './CeckRegistration';
import { OpeningCountdown } from './OpeningCountdown';
import { CrowdsaleTokenInfo } from './CrowdsaleTokenInfo';

import CrowdsaleData from 'crowdsale/build/contracts/RuhrCrowdsale.json';
import CrowdsaleDeployerData from 'crowdsale/build/contracts/RuhrCrowdsaleDeployer.json';
import TokenData from 'crowdsale/build/contracts/RuhrToken.json';

function CrowdsaleNotStarted({ crowdsaleInfo, crowdsaleAddress }) {
  return (
    <div className="Crowdsale">
      <h3>ETH.RUHR ICO will be live soon!</h3>
      <CrowdsaleContractInfo address={crowdsaleAddress} />
      <div className="column column-2">
        <OpeningCountdown openingTime={crowdsaleInfo.openingTime} />
        <CrowdsaleTokenInfo crowdsaleInfo={crowdsaleInfo} />
      </div>
    </div>
  );
}

function CrowdsaleFinished({
  crowdsaleInfo,
  crowdsaleAddress,
  accountAddress,
  onCheckRegistration
}) {
  return (
    <div className="Crowdsale">
      <h3>ETH.RUHR ICO is over!</h3>
      <CrowdsaleContractInfo address={crowdsaleAddress} />
      <div className="column column-2">
        <ClosingCountdown closingTime={crowdsaleInfo.closingTime} />
        <TokenDistributionCounter weiRaised={crowdsaleInfo.weiRaised} />
      </div>
      <CheckRegistration
        accountAddress={accountAddress}
        onCheckRegistration={onCheckRegistration}
      />
    </div>
  );
}

function CrowdsaleInProgress({
  crowdsaleInfo,
  crowdsaleAddress,
  accountAddress,
  onContribute,
  onCheckRegistration
}) {
  return (
    <div className="Crowdsale">
      <h3>ETH.RUHR ICO is live!</h3>
      <CrowdsaleContractInfo address={crowdsaleAddress} />
      <div className="column column-2">
        <ClosingCountdown closingTime={crowdsaleInfo.closingTime} />
        <TokenDistributionCounter weiRaised={crowdsaleInfo.weiRaised} />
      </div>
      <Register onContribute={onContribute} />
      <CheckRegistration
        accountAddress={accountAddress}
        onCheckRegistration={onCheckRegistration}
      />
    </div>
  );
}

export class Crowdsale extends Component {
  constructor(props) {
    super(props);

    this.state = {
      crowdsaleInfo: null
    };
  }

  async componentDidMount() {
    this.interval = setInterval(() => this.forceUpdate(), 5000);

    this.crowdsaleDeployer = this.createCrowdsaleDeployerContract(
      this.props.web3
    );
    this.crowdsale = await this.createCrowdsaleContract(this.props.web3);
    this.token = await this.createTokenContract(this.props.web3);

    this.loadCrowdsaleInfo();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  createCrowdsaleDeployerContract = web3 => {
    const network = CrowdsaleDeployerData.networks[this.props.netId];
    if (!network) {
      throw new Error(
        `RuhrCrowdsaleDeployer not deployed to network ${this.props.netId}`
      );
    }

    return new web3.eth.Contract(CrowdsaleDeployerData.abi, network.address);
  };

  createCrowdsaleContract = async web3 => {
    const crowdsaleAddress = await this.crowdsaleDeployer.methods
      .crowdsale()
      .call();

    console.log('crowdsaleAddress', crowdsaleAddress);
    return new web3.eth.Contract(CrowdsaleData.abi, crowdsaleAddress, {
      from: this.props.accounts[0]
    });
  };

  createTokenContract = async web3 => {
    const tokenAddress = await this.crowdsaleDeployer.methods.token().call();

    console.log('tokenAddress', tokenAddress);
    return new web3.eth.Contract(TokenData.abi, tokenAddress, {
      from: this.props.accounts[0]
    });
  };

  loadCrowdsaleInfo = async () => {
    const data = await Promise.all([
      this.crowdsale.methods.weiRaised().call(),
      this.crowdsale.methods.cap().call(),
      this.crowdsale.methods.openingTime().call(),
      this.crowdsale.methods.closingTime().call()
    ]);

    const crowdsaleInfo = {
      weiRaised: Web3.utils.fromWei(data[0]),
      cap: Web3.utils.fromWei(data[1]),
      openingTime: moment.unix(data[2]), // moment().subtract(15, 'seconds'),
      closingTime: moment.unix(data[3]) // moment().subtract(1, 'hour'),
    };

    console.log('crowdsaleInfo', crowdsaleInfo, data[2], data[3]);
    this.setState({ crowdsaleInfo });
  };

  onContribute = async () => {
    const beneficiary = this.props.accounts[0];
    const amount = Web3.utils.toWei('0.01');

    console.log(`contributing to beneficiary ${beneficiary}`);
    try {
      const tx = await this.crowdsale.methods
        .buyTokens(beneficiary)
        .send({ value: amount });
    } catch (ex) {
      console.error(ex);
    }
  };

  onCheckRegistration = async address => {
    try {
      const balanceInWei = await this.token.methods.balanceOf(address).call();
      return Web3.utils.fromWei(balanceInWei);
    } catch (ex) {
      console.error(ex);
      return '';
    }
  };

  render() {
    if (!this.state.crowdsaleInfo) {
      return <div>Loading ...</div>;
    }

    const crowdsaleInfo = this.state.crowdsaleInfo;
    const now = moment();

    if (now.isBefore(crowdsaleInfo.openingTime)) {
      return (
        <CrowdsaleNotStarted
          crowdsaleInfo={crowdsaleInfo}
          crowdsaleAddress={this.crowdsale.options.address}
        />
      );
    } else if (now.isAfter(crowdsaleInfo.closingTime)) {
      return (
        <CrowdsaleFinished
          crowdsaleInfo={crowdsaleInfo}
          crowdsaleAddress={this.crowdsale.options.address}
          accountAddress={this.props.accounts[0]}
          onCheckRegistration={this.onCheckRegistration}
        />
      );
    }

    return (
      <CrowdsaleInProgress
        crowdsaleInfo={crowdsaleInfo}
        crowdsaleAddress={this.crowdsale.options.address}
        accountAddress={this.props.accounts[0]}
        onContribute={this.onContribute}
        onCheckRegistration={this.onCheckRegistration}
      />
    );
  }
}
