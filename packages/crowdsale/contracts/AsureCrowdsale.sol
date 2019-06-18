pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/validation/WhitelistCrowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "./AsureBonusesCrowdsale.sol";

contract AsureCrowdsale is Crowdsale, TimedCrowdsale, WhitelistCrowdsale, AsureBonusesCrowdsale {
  using SafeERC20 for ERC20;

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
  {
    if (!isWhitelistAdmin(owner)) {
      addWhitelistAdmin(owner);
    }
  }

  function addWhitelistedAccounts(address[] memory accounts) public onlyWhitelistAdmin {
    for (uint i = 0; i < accounts.length; i++) {
      _addWhitelisted(accounts[i]);
    }
  }

  function burn() public {
    require(hasClosed());
    ERC20Burnable burnableToken = ERC20Burnable(address(token()));
    burnableToken.burn(burnableToken.balanceOf(address(this)));
  }

  /**
    * @dev Transfer tokens originally intended to be sold as part of this crowdsale to an IEO.
    * @param to Token beneficiary
    * @param value Amount of wei to transfer
    */
  function transferToIEO(address to, uint256 value) onlyOwner public {
    require(!hasClosed());
    token().safeTransfer(to, value);
  }

  /**
    * @dev Extend parent behavior requiring a minimum contribution of 0.5 ETH.
    * @param _beneficiary Token beneficiary
    * @param _weiAmount Amount of wei contributed
    */
  function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal view {
    require(_weiAmount >= 5 * 10 ** 17);
    super._preValidatePurchase(_beneficiary, _weiAmount);
  }
}
