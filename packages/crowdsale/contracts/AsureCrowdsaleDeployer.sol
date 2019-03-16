pragma solidity ^0.5.0;

import "./AsureToken.sol";
import "./AsureCrowdsale.sol";
import "openzeppelin-solidity/contracts/drafts/TokenVesting.sol";

contract VestingUser {
  address payable public _addr;
  uint256 public _amount;
  address payable public _tokenVestingAddr;

  function addr() public view returns (address) {
    return _addr;
  }

  function amount() public view returns (uint256) {
    return _amount;
  }

  function tokenVestingAddr() public view returns (address) {
    return _tokenVestingAddr;
  }
}


contract AsureCrowdsaleDeployer {
  AsureToken public token;
  AsureCrowdsale public presale;
  AsureCrowdsale public mainsale;

  constructor(
    address payable owner,
    uint256 preSaleOpeningTime, // opening time in unix epoch seconds
    uint256 preSaleClosingTime, // closing time in unix epoch seconds
    uint256 mainSaleOpeningTime, // mainSale start
    uint256 mainSaleClosingTime//,   // mainSale end
    //VestingUser[] memory teamUsers,
    //VestingUser[] memory advisorUsers
  )
  public
  {
    token = new AsureToken("AsureToken", "ASR", 18);

    presale = new AsureCrowdsale(
      1000, // rate, in AsureTokens - 1 ETH == 1000 RUHR
      owner, // wallet to send Ether
      token, // the token
      10 * 10 ** 24, // total cap, in wei - 20 Millionen
      preSaleOpeningTime, // opening time in unix epoch seconds
      preSaleClosingTime  // closing time in unix epoch seconds
    );


    token.mint(address(presale), 10 * 10 ** 24);

    token.mint(0xcbBc3D3d381f3A9a48CbAE9Ca701aC3c92e0aEA5, 5 * 10 ** 24);
    //bounty
    token.mint(0xcbBc3D3d381f3A9a48CbAE9Ca701aC3c92e0aEA5, 5 * 10 ** 24);
    //family & friends

    mainsale = new AsureCrowdsale(
      1000, // rate, in AsureTokens - 1 ETH == 1000
      owner, // wallet to send Ether
      token, // the token
      35 * 10 ** 24, // total cap, in wei - 40 Millionen
      mainSaleOpeningTime, // opening time in unix epoch seconds
      mainSaleClosingTime  // closing time in unix epoch seconds
    );

    token.mint(address(mainsale), 35 * 10 ** 24);
    //foundation
    token.mint(0xcbBc3D3d381f3A9a48CbAE9Ca701aC3c92e0aEA5, 35 * 10 ** 24);


//    for (uint i = 0; i < teamUsers.length; i++) {
//        token.mint(teamUsers[i].tokenVestingAddr(), teamUsers[i].amount());
//    }
//
//    for (uint i = 0; i < advisorUsers.length; i++) {
//      token.mint(advisorUsers[i].tokenVestingAddr(), advisorUsers[i].amount());
//    }

    /*
          //team
          TokenVesting team = new TokenVesting(0xcbBc3D3d381f3A9a48CbAE9Ca701aC3c92e0aEA5,
          mainSaleOpeningTime, //unix timestemp
          0, //cliffDuration
          63072000, // duration in sec
          false // bool revocable
          );
          token.mint(address(team), 8*10**24);


    //advisor
    TokenVesting advisor = new TokenVesting(owner,
      mainSaleOpeningTime, //unix timestemp
      0, //cliffDuration
      63072000, // duration in s
      false // bool revocable
    );

    token.mint(address(advisor), 2 * 10 ** 24);
    */
  }
}

/*
const year1 = 31536000 // ~1 yr = 60*60*24*365
const year2 = 63072000 // ~2 yr = 60*60*24*365*2
const year3 = 94608000 // ~3 yr = 60*60*24*365*3
const year4 = 126144000 // ~4yrs =60*60*24*365*4
*/
