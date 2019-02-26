import React from 'react';

export function CrowdsaleTokenInfo({ crowdsaleInfo }) {
  return (
    <div className="CrowdsaleTokenInfo Box">
      <h4>Token Info</h4>
      <table>
        <tbody>
        <tr>
          <th></th>
          <th></th>
        </tr>
        <tr>
          <td>Symbol</td>
          <td>RUHR</td>
        </tr>
        <tr>
          <td>RUHR Token Amount</td>
          <td>40 Million</td>
        </tr>
        <tr>
          <td>RUHR Token Price</td>
          <td>0.0001 ETH</td>
        </tr>
        <tr>
          <td>Crowdsale Opening</td>
          <td>{crowdsaleInfo.openingTime.format('L')}</td>
        </tr>
        <tr>
          <td>Crowdsale Closing</td>
          <td>{crowdsaleInfo.closingTime.format('L')}</td>
        </tr>
        </tbody>
      </table>
    </div>
  );
}
