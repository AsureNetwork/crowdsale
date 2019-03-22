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
 * @dev Crowdsale with bonus rate which will be lowered to default rate after
 * bonus time is reached.
 */
contract AsureBonusesCrowdsale is TimedCrowdsale, Ownable {
  using SafeMath for uint256;
  uint256 private _bonusRate;
  uint256 private _bonusTime;
  uint256 private _defaultRate;

  event RatesUpdated(uint256 bonusRate, uint256 bonusTime, uint256 defaultRate);

  /**
   * @dev Constructor, takes initial and bonus rates of tokens received per wei contributed.
   * @param bonusRate Number of token units a buyer gets per wei before bonus time
   * @param bonusTime The crowdsale bonus time in unix epoch seconds
   * @param defaultRate Number of token units a buyer gets per wei after the bonus time
   * @param owner of the crowdsale
   */
  constructor (uint256 bonusRate, uint256 bonusTime, uint256 defaultRate, address owner) public
  {
    updateRates(bonusRate, bonusTime, defaultRate);
    transferOwnership(owner);
  }

  /**
   * The base rate function is overridden to revert, since this crowdsale doesn't use it, and
   * all calls to it are a mistake.
   */
  function rate() public view returns (uint256) {
    revert();
  }

  /**
   * @return the number of token units a buyer gets per wei before the bonus time.
   */
  function bonusRate() public view returns (uint256) {
    return _bonusRate;
  }

  /**
   * @return the crowdsale bonus time in unix epoch seconds.
   */
  function bonusTime() public view returns (uint256) {
    return _bonusTime;
  }

  /**
   * @return the number of token units a buyer gets per wei after the bonus time.
   */
  function defaultRate() public view returns (uint256) {
    return _defaultRate;
  }

  /**
   * @dev Owner can update bonus rate, bonus time, and default rate before crowdsale opened.
   * @param newBonusRate Number of token units a buyer gets per wei before bonus time
   * @param newBonusTime The crowdsale bonus time in unix epoch seconds
   * @param newDefaultRate Number of token units a buyer gets per wei after the bonus time
   */
  function updateRates(uint256 newBonusRate, uint256 newBonusTime, uint256 newDefaultRate) public onlyOwner {
    require(!isOpen() && !hasClosed());
    require(newBonusRate > 0);
    require(newBonusTime >= openingTime() && newBonusTime < closingTime());
    require(newDefaultRate > 0);

    _bonusRate = newBonusRate;
    _bonusTime = newBonusTime;
    _defaultRate = newDefaultRate;

    emit RatesUpdated(_bonusRate, _bonusTime, _defaultRate);
  }

  /**
   * @dev Returns the rate of tokens per wei at the present time.
   * Note that, rate can be changed by the owner until the crowdsale is open.
   * @return The number of tokens a buyer gets per wei at a given time
   */
  function getCurrentRate() public view returns (uint256) {
    if (!isOpen()) {
      return 0;
    }

    if (block.timestamp <= _bonusTime) {
      return _bonusRate;
    }

    return _defaultRate;
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
