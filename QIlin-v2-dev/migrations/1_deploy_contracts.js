const Factory = artifacts.require("./PoolFactory.sol");

module.exports = async function (deployer) {
  await deployer.deploy(Factory);
};
