pragma solidity ^0.5.0;

import "./AsureToken.sol";
import "./AsureCrowdsale.sol";
import "openzeppelin-solidity/contracts/drafts/TokenVesting.sol";

contract AsureCrowdsaleDeployer {
  AsureToken public token;
  AsureCrowdsale public presale;
  AsureCrowdsale public mainsale;

  constructor(
    address payable owner,
    address payable wallet,
    uint256 preSaleOpeningTime,  // opening time in unix epoch seconds
    uint256 preSaleClosingTime,  // closing time in unix epoch seconds
    uint256 mainSaleOpeningTime, // mainSale start
    uint256 mainSaleClosingTime, // mainSale end
    address[] memory teamAddr,
    uint256[] memory teamAmounts,
    address[] memory advisorAddr,
    uint256[] memory advisorAmounts
  )
  public
  {
    require(teamAddr.length == teamAmounts.length);
    require(advisorAddr.length == advisorAmounts.length);

    token = new AsureToken(owner, "AsureToken", "ASR", 18);

    presale = new AsureCrowdsale(
      1000, // rate, in AsureTokens - 1 ETH == 1000 RUHR
      owner, // owner
      wallet, // wallet to send Ether
      token, // the token
      10 * 10 ** 24, // total cap, in wei - 20 Millionen
      preSaleOpeningTime, // opening time in unix epoch seconds
      preSaleClosingTime  // closing time in unix epoch seconds
    );

    token.mint(address(presale), 10 * 10 ** 24);
    //bounty
    token.mint(0xcbBc3D3d381f3A9a48CbAE9Ca701aC3c92e0aEA5, 5 * 10 ** 24);
    //family & friends
    token.mint(0xcbBc3D3d381f3A9a48CbAE9Ca701aC3c92e0aEA5, 5 * 10 ** 24);

    mainsale = new AsureCrowdsale(
      1000, // rate, in AsureTokens - 1 ETH == 1000
      owner, // owner
      wallet, // wallet to send Ether
      token, // the token
      35 * 10 ** 24, // total cap, in wei - 40 Millionen
      mainSaleOpeningTime, // opening time in unix epoch seconds
      mainSaleClosingTime  // closing time in unix epoch seconds
    );

    token.mint(address(mainsale), 35 * 10 ** 24);
    //foundation
    token.mint(0xcbBc3D3d381f3A9a48CbAE9Ca701aC3c92e0aEA5, 35 * 10 ** 24);


    for (uint i = 0; i < teamAddr.length; i++) {
        token.mint(teamAddr[i], teamAmounts[i]);
    }

    for (uint i = 0; i < advisorAddr.length; i++) {
      token.mint(advisorAddr[i], advisorAmounts[i]);
    }

  }
}


