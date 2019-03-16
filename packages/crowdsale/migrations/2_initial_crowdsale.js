const moment = require('moment');

const AsureCrowdsaleDeployer = artifacts.require("AsureCrowdsaleDeployer");
const TokenVesting = artifacts.require("TokenVesting");


async function createVestingContract(beneficiary, mainSaleOpeningTime, twoyears) {
    const instance = await TokenVesting.new(
        beneficiary.addr, //address
        mainSaleOpeningTime.unix(), //unix timestemp
        0, //cliffDuration
        twoyears, // duration in sec ~2 yr = 60*60*24*365*2
        false // bool revocable
    );
    beneficiary.tokenVestingAddr = instance.address;
}

module.exports = async function (deployer, network) {
    await deployer;

    let owner = '0x38D1Ea5E7EA932E83b482F4816F2ee1C61A288c2';
    if (network === 'development') {
        owner = '0xd7da996cc3c3186b87c5ea23599dec97153bcc21'; // account 4
    }

    const twoyears = 63072000; // ~2 yr = 60*60*24*365*2
    const dateFormat = "YYYY-MM-DD HH:mm";
    const preSaleOpeningTime = moment('2019-08-01 00:00', dateFormat);
    const preSaleClosingTime = moment('2019-08-15 00:00', dateFormat);

    const mainSaleOpeningTime = moment('2019-12-1 00:00', dateFormat);
    const mainSaleClosingTime = moment('2019-12-31 00:00', dateFormat);

    const teamBeneficiaries = [
        {
            addr: '0xcbBc3D3d381f3A9a48CbAE9Ca701aC3c92e0aEA5',
            amount: 1,
            tokenVestingAddr: null
        },
        {
            addr: '0xcbBc3D3d381f3A9a48CbAE9Ca701aC3c92e0aEA5',
            amount: 1,
            tokenVestingAddr: null
        }
    ];

    const advisorBeneficiaries = [
        {
            addr: '0xcbBc3D3d381f3A9a48CbAE9Ca701aC3c92e0aEA5',
            amount: 1,
            tokenVestingAddr: null
        },
        {
            addr: '0xcbBc3D3d381f3A9a48CbAE9Ca701aC3c92e0aEA5',
            amount: 1,
            tokenVestingAddr: null
        }
    ];

    for (let i = 0; i < teamBeneficiaries.length; i++) {
        await createVestingContract(teamBeneficiaries[i], mainSaleOpeningTime, twoyears);
    }

    for (let i = 0; i < advisorBeneficiaries.length; i++) {
        await createVestingContract(advisorBeneficiaries[i], mainSaleOpeningTime, twoyears);
    }

    const crowdsale = await AsureCrowdsaleDeployer.new(
        owner,
        preSaleOpeningTime.unix(),
        preSaleClosingTime.unix(),
        mainSaleOpeningTime.unix(),
        mainSaleClosingTime.unix(),
        teamBeneficiaries.map(b => b.tokenVestingAddr),
        teamBeneficiaries.map(b => b.amount),
        advisorBeneficiaries.map(b => b.tokenVestingAddr),
        advisorBeneficiaries.map(b => b.amount),
    );

    console.log(`AsureCrowdsale deployed at ${crowdsale.address}`);
};

/*
const oneyear = 31536000 // ~1 yr = 60*60*24*365
const twoyears = 63072000 // ~2 yr = 60*60*24*365*2
const threeyears = 94608000 // ~3 yr = 60*60*24*365*3
const fouryears = 126144000 // ~4yrs =60*60*24*365*4
*/
