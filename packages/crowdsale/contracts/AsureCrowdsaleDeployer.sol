pragma solidity ^0.5.0;

import "./AsureToken.sol";
import "./AsureCrowdsale.sol";
import "openzeppelin-solidity/contracts/drafts/TokenVesting.sol";

contract AsureCrowdsaleDeployer is Ownable {
  AsureToken public token;
  AsureCrowdsale public presale;
  AsureCrowdsale public mainsale;

  uint256 private constant decimalFactor = 10 ** uint256(18);
  uint256 private constant AVAILABLE_TOTAL_SUPPLY = 100000000 * decimalFactor;
  uint256 private constant AVAILABLE_PRESALE_SUPPLY = 10000000 * decimalFactor; // 10% Released at Token Distribution (TD)
  uint256 private constant AVAILABLE_MAINSALE_SUPPLY = 35000000 * decimalFactor; // 35% Released at Token Distribution (TD)
  uint256 private constant AVAILABLE_FOUNDATION_SUPPLY = 35000000 * decimalFactor; // 35% Released at Token Distribution (TD)
  uint256 private constant AVAILABLE_BOUNTY_SUPPLY = 5000000 * decimalFactor; // 5% Released at TD
  uint256 private constant AVAILABLE_FAMILYFRIENDS_SUPPLY = 5000000 * decimalFactor; // 5% Released at TD
  uint256 private constant AVAILABLE_TEAM_SUPPLY = 8000000 * decimalFactor; // 8% Released at TD +2 years
  uint256 private constant AVAILABLE_ADVISOR_SUPPLY = 2000000 * decimalFactor; // 2% Released at TD +2 years

  constructor(address payable owner)
  public
  {
    transferOwnership(owner);
    token = new AsureToken(owner, "AsureToken", "ASR", 18, AVAILABLE_TOTAL_SUPPLY);
  }

  function mint(
    address payable foundationWallet,
    address payable bountyWallet,
    address payable familyFriendsWallet,
    address[] memory teamAddr,
    uint256[] memory teamAmounts,
    address[] memory advisorAddr,
    uint256[] memory advisorAmounts
  ) onlyOwner public returns (bool) {
    token.mint(foundationWallet, AVAILABLE_FOUNDATION_SUPPLY);
    token.mint(bountyWallet, AVAILABLE_BOUNTY_SUPPLY);
    token.mint(familyFriendsWallet, AVAILABLE_FAMILYFRIENDS_SUPPLY);
    for (uint i = 0; i < teamAddr.length; i++) {
      token.mint(teamAddr[i], teamAmounts[i] * decimalFactor);
    }
    for (uint i = 0; i < advisorAddr.length; i++) {
      token.mint(advisorAddr[i], advisorAmounts[i] * decimalFactor);
    }

    require(token.totalSupply() == AVAILABLE_TOTAL_SUPPLY - AVAILABLE_PRESALE_SUPPLY - AVAILABLE_MAINSALE_SUPPLY, "AVAILABLE_TOTAL_SUPPLY");
    return true;
  }

  function createPreSale(
    uint256 rate,
    address payable owner,
    address payable crowdsaleWallet,
    uint256 preSaleOpeningTime, // preSale opening time in unix epoch seconds
    uint256 preSaleClosingTime // preSale closing time in unix epoch seconds
  ) onlyOwner public returns (bool) {
    require(address(presale) == address(0), "mainsale already initialized");

    presale = new AsureCrowdsale(
      rate, // rate, in AsureTokens - 1 ETH == 1000 RUHR
      owner, // owner
      crowdsaleWallet, // wallet to send Ether
      token, // the token
      preSaleOpeningTime, // opening time in unix epoch seconds
      preSaleClosingTime  // closing time in unix epoch seconds
    );
    token.mint(address(presale), AVAILABLE_PRESALE_SUPPLY);

    require(token.totalSupply() == AVAILABLE_TOTAL_SUPPLY - AVAILABLE_MAINSALE_SUPPLY, "AVAILABLE_TOTAL_SUPPLY");
    return true;
  }

  function createMainSale(
    uint256 rate,
    address payable owner,
    address payable crowdsaleWallet,
    uint256 mainSaleOpeningTime, // mainSale opening time in unix epoch seconds
    uint256 mainSaleClosingTime // mainSale closing time in unix epoch seconds
  ) onlyOwner public returns (bool) {
    require(address(mainsale) == address(0), "mainsale already initialized");

    mainsale = new AsureCrowdsale(
      rate, // rate, in AsureTokens - 1 ETH == 1000
      owner, // owner
      crowdsaleWallet, // wallet to send Ether
      token, // the token
      mainSaleOpeningTime, // opening time in unix epoch seconds
      mainSaleClosingTime  // closing time in unix epoch seconds
    );
    token.mint(address(mainsale), AVAILABLE_MAINSALE_SUPPLY);

    require(token.totalSupply() == AVAILABLE_TOTAL_SUPPLY, "AVAILABLE_TOTAL_SUPPLY");
    return true;
  }
}


