pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "../AsureBonusesCrowdsale.sol";

contract TestAsureBonusesCrowdsale is Crowdsale, TimedCrowdsale, AsureBonusesCrowdsale {
  constructor(
    uint256 rate,
    address payable owner,
    address payable crowdsaleWallet,
    IERC20 token,
    uint256 openingTime,
    uint256 closingTime
  )
  public
  Crowdsale(rate, crowdsaleWallet, token)
  TimedCrowdsale(openingTime, closingTime)
  AsureBonusesCrowdsale(rate, owner)
  {}
}
