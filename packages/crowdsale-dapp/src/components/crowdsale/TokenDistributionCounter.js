import React from 'react';

export function TokenDistributionCounter({ weiRaised }) {
  return (
    <div className="TokenDistributionCounter Box">
      <h1>{weiRaised}</h1>
      <strong>RUHR Tokens distributed</strong>
    </div>
  );
}
