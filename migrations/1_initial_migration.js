const Migrations = artifacts.require("Migrations");
const Lottery = artifacts.require("Lottery");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(Lottery);
};
