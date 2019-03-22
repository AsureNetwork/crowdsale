pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Capped.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract AsureToken is ERC20, ERC20Detailed, ERC20Mintable, ERC20Burnable, ERC20Capped, Ownable {
  constructor(address owner)
  ERC20Burnable()
  ERC20Mintable()
  ERC20Detailed("Asure", "ASR", 18)
  ERC20Capped(100*10**24) // 100 million ASR
  ERC20()
  public
  {
    transferOwnership(owner);
  }

  /**
   * @dev ERC223 alternative emergency Token Extraction
   */
  function emergencyTokenExtraction(address erc20tokenAddr) onlyOwner
  public returns (bool) {
    IERC20 erc20token = IERC20(erc20tokenAddr);
    uint256 balance = erc20token.balanceOf(address(this));
    if (balance == 0) {
      revert();
    }
    return erc20token.transfer(msg.sender, balance);
  }
}
