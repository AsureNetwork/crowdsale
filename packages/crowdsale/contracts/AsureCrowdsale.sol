pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/validation/WhitelistCrowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "./AsureBonusesCrowdsale.sol";

contract AsureCrowdsale is Crowdsale, CappedCrowdsale, TimedCrowdsale, WhitelistCrowdsale, AsureBonusesCrowdsale {
  //
  constructor(
    uint256 rate, // rate, in Asure Tokens
    address payable wallet, // wallet to send Ether
    IERC20 token, // the token
    uint256 cap, // total cap, in wei
    uint256 openingTime, // opening time in unix epoch seconds
    uint256 closingTime    // closing time in unix epoch seconds
  )
  public
  Crowdsale(rate, wallet, token)
  CappedCrowdsale(cap)
  TimedCrowdsale(openingTime, closingTime)
  AsureBonusesCrowdsale(rate, wallet)
  {
    // nice, we just created a crowdsale that's only open
    // for a certain amount of time
    // and stops accepting contributions once it reaches `cap`
    addWhitelistAdmin(wallet);
    addWhitelistAdmin(0xcbBc3D3d381f3A9a48CbAE9Ca701aC3c92e0aEA5);
  }

  function addWhitelistedAccounts(address[] memory accounts) public onlyWhitelistAdmin {
    for (uint i = 0; i < accounts.length; i++) {
      _addWhitelisted(accounts[i]);
    }
  }

}
