const Migrations = artifacts.require("Bienes");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};
