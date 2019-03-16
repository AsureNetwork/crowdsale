const fs = require('fs');
const moment = require('moment');
const crowdsale = require('../crowdsale.json');

const AsureCrowdsaleDeployer = artifacts.require("AsureCrowdsaleDeployer");
const TokenVesting = artifacts.require("TokenVesting");


async function createVestingContract(beneficiary, mainSaleOpeningTime, twoyears) {
    const instance = await TokenVesting.new(
        beneficiary.owner, //address
        mainSaleOpeningTime, //unix timestemp
        0, //cliffDuration
        twoyears, // duration in sec ~2 yr = 60*60*24*365*2
        false // bool revocable
    );
    beneficiary.addr = instance.address;
}

module.exports = async function (deployer, network) {
    await deployer;

    let owner = '0x38D1Ea5E7EA932E83b482F4816F2ee1C61A288c2';
    if (network === 'development') {
        owner = '0xd7da996cc3c3186b87c5ea23599dec97153bcc21'; // account 4
    }

    const preSaleOpeningTime = moment(crowdsale.preSale.opening, crowdsale.dateFormat).unix();
    const preSaleClosingTime = moment(crowdsale.preSale.closing, crowdsale.dateFormat).unix();
    const mainSaleOpeningTime = moment(crowdsale.mainSale.opening, crowdsale.dateFormat).unix();
    const mainSaleClosingTime = moment(crowdsale.mainSale.closing, crowdsale.dateFormat).unix();

    const twoyears = 63072000; // ~2 yr = 60*60*24*365*2

    for (let i = 0; i < crowdsale.team.length; i++) {
        await createVestingContract(crowdsale.team[i], mainSaleOpeningTime, twoyears);
    }

    for (let i = 0; i < crowdsale.advisor.length; i++) {
        await createVestingContract(crowdsale.advisor[i], mainSaleOpeningTime, twoyears);
    }

    const crowdsaleDeployer = await AsureCrowdsaleDeployer.new(
        owner,
        preSaleOpeningTime,
        preSaleClosingTime,
        mainSaleOpeningTime,
        mainSaleClosingTime,
        crowdsale.team.map(b => b.addr),
        crowdsale.team.map(b => b.amount),
        crowdsale.advisor.map(b => b.addr),
        crowdsale.advisor.map(b => b.amount),
    );
    crowdsale.token.addr = await crowdsaleDeployer.token.call();
    crowdsale.preSale.addr = await crowdsaleDeployer.presale.call();
    crowdsale.mainSale.addr = await crowdsaleDeployer.mainsale.call();

    console.log(`AsureCrowdsale deployment successful.`);
    fs.writeFileSync(`crowdsale-${network}.json`, JSON.stringify(crowdsale, null, 2));
};

/*
const oneyear = 31536000 // ~1 yr = 60*60*24*365
const twoyears = 63072000 // ~2 yr = 60*60*24*365*2
const threeyears = 94608000 // ~3 yr = 60*60*24*365*3
const fouryears = 126144000 // ~4yrs =60*60*24*365*4
*/
