pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";

contract TestToken is ERC20, ERC20Mintable {
  constructor() ERC20Mintable() ERC20() public
  {}
}
