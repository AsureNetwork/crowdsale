import React, { Component } from 'react';

export class CheckRegistration extends Component{
  constructor(props) {
    super(props);
    this.state = { address: this.props.accountAddress}
  }

  onClick = async () => {
    const balance = await this.props.onCheckRegistration(this.state.address);
    this.setState({ balance });
  };

  render() {
    let balance;
    if (this.state.balance) {
      balance = (
        <h3>{this.state.balance} RUHR Token</h3>
      )
    }

    return (
      <div className="CheckRegistration Box">
        <input
          type="text"
          value={this.state.address}
          onChange={evt => this.setState({ address: evt.target.value })}
        />
        <button onClick={this.onClick}>Check your Registration</button>
        {balance}
      </div>
    );
  }
}
