pragma solidity ^0.4.23;

contract Greeter {
    uint256 public greetCounter;

    function greet() public returns (string message) {
        greetCounter++;
        return "Hello, ETH.RUHR";
    }
}