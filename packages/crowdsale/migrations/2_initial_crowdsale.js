const fs = require('fs');
const path = require('path');
const moment = require('moment');

const AsureCrowdsaleDeployer = artifacts.require("AsureCrowdsaleDeployer");
const TokenVesting = artifacts.require("TokenVesting");

module.exports = async function (deployer, network) {
    await deployer;

    const crowdsale = loadCrowdsaleConfig(network);

    const preSaleOpeningTime = moment(crowdsale.preSale.opening, crowdsale.dateFormat).unix();
    const preSaleClosingTime = moment(crowdsale.preSale.closing, crowdsale.dateFormat).unix();
    const mainSaleOpeningTime = moment(crowdsale.mainSale.opening, crowdsale.dateFormat).unix();
    const mainSaleClosingTime = moment(crowdsale.mainSale.closing, crowdsale.dateFormat).unix();

    const twoYearsInSeconds = 63072000; // ~2 yr = 60*60*24*365*2

    for (let i = 0; i < crowdsale.team.length; i++) {
        await createVestingContract(crowdsale.team[i], mainSaleOpeningTime, twoYearsInSeconds);
    }

    for (let i = 0; i < crowdsale.advisor.length; i++) {
        await createVestingContract(crowdsale.advisor[i], mainSaleOpeningTime, twoYearsInSeconds);
    }

    const crowdsaleDeployer = await AsureCrowdsaleDeployer.new(
        crowdsale.owner,
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
    fs.writeFileSync(`crowdsale-${network}-final.json`, JSON.stringify(crowdsale, null, 2));
};


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

function loadCrowdsaleConfig(network) {
    const fileName = `crowdsale-${network}.json`;

    if (!fs.existsSync(path.join(process.cwd(), fileName))) {
        throw Error(
            `No crowdsale configuration file (${path.join(process.cwd(), fileName)}) for network "${network}" found.`
        )
    }

    return require(`../${fileName}`);
}