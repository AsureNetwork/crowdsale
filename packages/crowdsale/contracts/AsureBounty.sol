pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract AsureBounty is Ownable {
  IERC20 public token;
  uint8 private constant decimals = 18;
  uint256 private constant decimalFactor = 10 ** uint256(decimals);

  constructor (address owner, address tokenAddr) public{
    transferOwnership(owner);
    token = IERC20(address(tokenAddr));
  }

  function drop(address[] memory recipients, uint256[] memory values) onlyOwner public {
    for (uint256 i = 0; i < recipients.length; i++) {
      token.transfer(recipients[i], values[i]);
    }
  }

  function airdrop(address[] memory recipients) onlyOwner public {
    for (uint256 i = 0; i < recipients.length; i++) {
      token.transfer(recipients[i], 100*decimalFactor); //
    }
  }
}
