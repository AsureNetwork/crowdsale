import React, { Component } from 'react';
import moment from 'moment';

export class ClosingCountdown extends Component{
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.updateTime();
    this.interval = setInterval(this.updateTime, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  updateTime = () => {
    const duration = this.props.closingTime - moment();
    const s = Math.floor((duration / 1000) % 60);
    const m = Math.floor((duration / 1000 / 60) % 60);
    const h = Math.floor((duration / (1000 * 60 * 60)) % 24);
    const d = Math.floor(duration / (1000 * 60 * 60 * 24));

    this.setState({s, m, h, d});
  };

  render() {
    return (
      <div className="ClosingCountdown Box">
        <h4>
          <strong>END DATE:</strong>
        </h4>
        <h4>
          <strong>{this.props.closingTime.format('LLL')}</strong>
        </h4>
        <div className="countdown">
          <div><strong>{this.state.d}</strong></div>
          <div><strong>{this.state.h}</strong></div>
          <div><strong>{this.state.m}</strong></div>
          <div><strong>{this.state.s}</strong></div>
        </div>
        <div className="countdown">
          <div><strong>DD</strong></div>
          <div><strong>HH</strong></div>
          <div><strong>MM</strong></div>
          <div><strong>SS</strong></div>
        </div>
      </div>
    );
  }
}
