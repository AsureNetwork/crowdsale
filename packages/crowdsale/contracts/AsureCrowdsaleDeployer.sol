pragma solidity ^0.5.0;

import "./AsureToken.sol";
import "./AsureCrowdsale.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/drafts/TokenVesting.sol";

contract AsureCrowdsaleDeployer is Ownable {
  using SafeMath for uint256;

  AsureToken public token;
  AsureCrowdsale public presale;
  AsureCrowdsale public mainsale;

  uint8 private constant decimals = 18;
  uint256 private constant decimalFactor = 10 ** uint256(decimals);
  uint256 private constant AVAILABLE_TOTAL_SUPPLY = 100000000 * decimalFactor;
  uint256 private constant AVAILABLE_PRESALE_SUPPLY = 10000000 * decimalFactor;       // 10% Released at Token Distribution (TD)
  uint256 private constant AVAILABLE_MAINSALE_SUPPLY = 35000000 * decimalFactor;      // 35% Released at Token Distribution (TD)
  uint256 private constant AVAILABLE_FOUNDATION_SUPPLY = 35000000 * decimalFactor;    // 35% Released at Token Distribution (TD)
  uint256 private constant AVAILABLE_BOUNTY_SUPPLY = 5000000 * decimalFactor;         // 5% Released at TD
  uint256 private constant AVAILABLE_FAMILYFRIENDS_SUPPLY = 5000000 * decimalFactor;  // 5% Released at TD
  uint256 private constant AVAILABLE_TEAM_SUPPLY = 8000000 * decimalFactor;           // 8% Released at TD +2 years
  uint256 private constant AVAILABLE_ADVISOR_SUPPLY = 2000000 * decimalFactor;        // 2% Released at TD +2 years
  uint256 private constant TOKEN_VESTING_DURATION_SECONDS = 63072000;                 // 2 years as seconds

  constructor(address owner) public {
    transferOwnership(owner);
    token = new AsureToken(owner);
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
    require(teamAddr.length == teamAmounts.length);
    require(advisorAddr.length == advisorAmounts.length);

    token.mint(foundationWallet, AVAILABLE_FOUNDATION_SUPPLY);
    token.mint(bountyWallet, AVAILABLE_BOUNTY_SUPPLY);
    token.mint(familyFriendsWallet, AVAILABLE_FAMILYFRIENDS_SUPPLY);
    require(
      token.totalSupply() == AVAILABLE_TOTAL_SUPPLY.sub(AVAILABLE_MAINSALE_SUPPLY).sub(AVAILABLE_PRESALE_SUPPLY).sub(AVAILABLE_ADVISOR_SUPPLY).sub(AVAILABLE_TEAM_SUPPLY),
      "AVAILABLE_FAMILYFRIENDS_SUPPLY"
    );


    for (uint i = 0; i < teamAddr.length; i++) {
      TokenVesting vesting = TokenVesting(teamAddr[i]);
      require(vesting.duration() == TOKEN_VESTING_DURATION_SECONDS);
      token.mint(teamAddr[i], teamAmounts[i].mul(decimalFactor));
    }
    require(
      token.totalSupply() == AVAILABLE_TOTAL_SUPPLY.sub(AVAILABLE_MAINSALE_SUPPLY).sub(AVAILABLE_PRESALE_SUPPLY).sub(AVAILABLE_ADVISOR_SUPPLY),
      "AVAILABLE_TEAM_SUPPLY"
    );


    for (uint i = 0; i < advisorAddr.length; i++) {
      TokenVesting vesting = TokenVesting(advisorAddr[i]);
      require(vesting.duration() == TOKEN_VESTING_DURATION_SECONDS);
      token.mint(advisorAddr[i], advisorAmounts[i].mul(decimalFactor));
    }
    require(
      token.totalSupply() == AVAILABLE_TOTAL_SUPPLY.sub(AVAILABLE_MAINSALE_SUPPLY).sub(AVAILABLE_PRESALE_SUPPLY),
      "AVAILABLE_ADVISOR_SUPPLY"
    );

    return true;
  }

  function createPreSale(
    uint256 bonusRate,
    uint256 bonusTime,
    uint256 defaultRate,
    address owner,
    address payable wallet,
    uint256 openingTime,
    uint256 closingTime
  ) onlyOwner public returns (bool) {
    require(address(presale) == address(0), "ALREADY_INITIALIZED");

    presale = new AsureCrowdsale(
      bonusRate,
      bonusTime,
      defaultRate,
      owner,
      wallet,
      token,
      openingTime,
      closingTime
    );
    token.mint(address(presale), AVAILABLE_PRESALE_SUPPLY);

    return true;
  }

  function createMainSale(
    uint256 bonusRate,
    uint256 bonusTime,
    uint256 defaultRate,
    address owner,
    address payable wallet,
    uint256 openingTime,
    uint256 closingTime
  ) onlyOwner public returns (bool) {
    require(address(mainsale) == address(0), "ALREADY_INITIALIZED");

    mainsale = new AsureCrowdsale(
      bonusRate,
      bonusTime,
      defaultRate,
      owner,
      wallet,
      token,
      openingTime,
      closingTime
    );
    token.mint(address(mainsale), AVAILABLE_MAINSALE_SUPPLY);

    return true;
  }
}


