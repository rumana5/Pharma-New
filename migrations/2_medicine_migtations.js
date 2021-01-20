var Medicine = artifacts.require("./Medicine.sol");

module.exports = function(deployer) {
  deployer.deploy(Medicine);
};
