pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/validation/WhitelistCrowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title AsureBonusesCrowdsale,
 * with changeble rate before crowdsale start
 */
contract AsureBonusesCrowdsale is TimedCrowdsale, Ownable {
  using SafeMath for uint256;
  uint256 private _initialRate;
  uint256 private _bonusRate;
  uint256 private _bonusTime;

  event RatesUpdated(uint256 initialRate, uint256 bonusRate, uint256 bonusTime);

  /**
   * @dev Constructor, takes initial and final rates of tokens received per wei contributed.
   * @param owner of the crowdsale
   * @param initialRate Number of tokens a buyer gets per wei at the start of the crowdsale
   */
  constructor (uint256 initialRate, uint256 bonusRate, uint256 bonusTime, address payable owner) public
  {
    updateRates(initialRate, bonusRate, bonusTime);
    transferOwnership(owner);
  }

  /**
   * The base rate function is overridden to revert, since this crowdsale doens't use it, and
   * all calls to it are a mistake.
   */
  function rate() public view returns (uint256) {
    revert();
  }

  /**
   * @return the initial rate of the crowdsale.
   */
  function initialRate() public view returns (uint256) {
    return _initialRate;
  }

  /**
   * @return the next Timeslot of the crowdsale.
   */
  function bonusTime() public view returns (uint256) {
    return _bonusTime;
  }

  /**
   * @return the next Rate of the crowdsale.
   */
  function bonusRate() public view returns (uint256) {
    return _bonusRate;
  }

  function updateRates(uint256 newInitialRate, uint256 newBonusRate, uint256 newBonusTime) public onlyOwner {
    require(!isOpen() && !hasClosed());
    require(newInitialRate > 0);
    require(newBonusRate > 0);
    require(newBonusTime >= openingTime() && newBonusTime < closingTime());

    _initialRate = newInitialRate;
    _bonusRate = newBonusRate;
    _bonusTime = newBonusTime;

    emit RatesUpdated(_initialRate, _bonusRate, _bonusTime);
  }

  /**
   * @dev Returns the rate of tokens per wei at the present time.
   * Note that, rate can be changed by the ownerw
   * @return The number of tokens a buyer gets per wei at a given time
   */
  function getCurrentRate() public view returns (uint256) {
    if (!isOpen()) {
      return 0;
    }

    if (block.timestamp >= _bonusTime) {
      return _bonusRate;
    }

    return _initialRate;
  }

  /**
   * @dev Overrides parent method taking into account variable rate.
   * @param weiAmount The value in wei to be converted into tokens
   * @return The number of tokens _weiAmount wei will buy at present time
   */
  function _getTokenAmount(uint256 weiAmount) internal view returns (uint256) {
    uint256 currentRate = getCurrentRate();
    return currentRate.mul(weiAmount);
  }
}
