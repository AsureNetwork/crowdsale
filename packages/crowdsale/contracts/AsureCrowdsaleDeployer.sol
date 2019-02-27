pragma solidity ^0.5.0;

import "./AsureToken.sol";
import "./AsureCrowdsale.sol";

contract AsureCrowdsaleDeployer {
    AsureToken public token;
    AsureCrowdsale public crowdsale;

    constructor(
        address payable wallet,
        uint256 openingTime,  // opening time in unix epoch seconds
        uint256 closingTime   // closing time in unix epoch seconds
    )
    public
    {
        token = new AsureToken("AsureToken", "ASR", 18);

        crowdsale = new AsureCrowdsale(
            1000,        // rate, in RUHRbits - 1 ETH == 1000 RUHR
            wallet,      // wallet to send Ether
            token,       // the token
            40*10**24,   // total cap, in wei - 40 Millionen
            openingTime, // opening time in unix epoch seconds
            closingTime  // closing time in unix epoch seconds
        );

        token.mint(address(crowdsale), 40*10**24);
    }
}
