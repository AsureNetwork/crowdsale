pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/validation/WhitelistCrowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "./AsureBonusesCrowdsale.sol";

contract AsureCrowdsale is Crowdsale, TimedCrowdsale, WhitelistCrowdsale, AsureBonusesCrowdsale {
  constructor(
    uint256 rate,                     // rate, in Asure Tokens
    address payable owner,            // owner
    address payable crowdsaleWallet,  // wallet to send Ether
    IERC20 token,                     // the token
    uint256 openingTime,              // opening time in unix epoch seconds
    uint256 closingTime               // closing time in unix epoch seconds
  )
  public
  Crowdsale(rate, crowdsaleWallet, token)
  TimedCrowdsale(openingTime, closingTime)
  AsureBonusesCrowdsale(rate, owner)
  {
    addWhitelistAdmin(owner);
  }

  function addWhitelistedAccounts(address[] memory accounts) public onlyWhitelistAdmin {
    for (uint i = 0; i < accounts.length; i++) {
      _addWhitelisted(accounts[i]);
    }
  }
}
