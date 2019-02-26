import React, { Component } from 'react';

import './App.css';
import { Crowdsale } from './components/crowdsale/Crowdsale';
import { LoadWeb3 } from './components/LoadWeb3';

class App extends Component {
  render() {
    return (
      <div className="App">
        <LoadWeb3
          netIds={[4, 17101710]}
          render={(web3, netId, accounts) => (
            <Crowdsale
              web3={web3}
              netId={netId}
              accounts={accounts}
            />
          )}
        />
      </div>
    );
  }
}

export default App;
