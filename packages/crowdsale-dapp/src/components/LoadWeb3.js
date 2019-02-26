import React, { Component } from 'react';
import Web3 from 'web3';

function Error({ message }) {
  return (
    <div className="error">
      <strong>Error:</strong>
      {message}
    </div>
  );
}

export class LoadWeb3 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      error: null,
      web3: null
    };
  }

  /*
   * Instantiate Web3 and make sure that:
   *  1. MetaMask Plugin is available
   *  2. MetaMask Plugin is unlocked
   *  3. A supported network is selected in MetaMask
   */
  async componentDidMount() {
    if (!window.web3 || !window.web3.currentProvider) {
      this.setState({ error: 'MetaMask nicht vorhanden.' });
      return;
    }

    const web3 = new Web3(window.web3.currentProvider);

    let accounts;
    try {
      accounts = await web3.eth.getAccounts();
    } catch (ex) {
      this.setState({
        isLoading: false,
        error: 'MetaMask gesperrt.'
      });
      return;
    }

    const netId = await web3.eth.net.getId();
    if (!this.props.netIds.includes(netId)) {
      this.setState({
        isLoading: false,
        error: `This app only supports the following networks: ${this.props.netIds.join(',')}`
      });
      return;
    }

    this.setState({
      isLoading: false,
      web3: web3,
      netId: netId,
      accounts: accounts
    });
  }

  render() {
    if (this.state.isLoading) {
      return (<div>Loading ...</div>)
    }

    if (this.state.error) {
      return (<Error message={this.state.error}/>);
    }

    console.log('Loaded web3', this.state.web3, this.state.netId, this.state.accounts);
    return this.props.render(this.state.web3, this.state.netId, this.state.accounts);
  }
}
