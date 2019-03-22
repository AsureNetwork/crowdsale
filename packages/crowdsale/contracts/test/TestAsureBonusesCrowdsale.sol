pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "../AsureBonusesCrowdsale.sol";

contract TestAsureBonusesCrowdsale is Crowdsale, TimedCrowdsale, AsureBonusesCrowdsale {
  constructor(
    uint256 bonusRate,
    uint256 bonusTime,
    uint256 defaultRate,
    address owner,
    address payable wallet,
    IERC20 token,
    uint256 openingTime,
    uint256 closingTime
  )
  public
  Crowdsale(1, wallet, token)
  TimedCrowdsale(openingTime, closingTime)
  AsureBonusesCrowdsale(bonusRate, bonusTime, defaultRate, owner)
  {}
}
