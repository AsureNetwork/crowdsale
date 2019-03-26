const {loadCrowdsaleConfig} = require("../utils/migrations");

const AsureToken = artifacts.require('AsureToken');
const AsureCrowdsale = artifacts.require('AsureCrowdsale');

const config = loadCrowdsaleConfig(null, 'development');

contract('Integration', async accounts => {
  before(async () => {

  });

  it('should ', function () {

  });

});
