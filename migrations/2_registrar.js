const Registrar = artifacts.require("Registrar");
const Bidder = artifacts.require("Bidder");

module.exports = function (deployer) {
  deployer.then(async () => {
    await deployer.deploy(Registrar);
    await deployer.deploy(Bidder, Registrar.address);
    registrarInstance = await Registrar.deployed();
    await registrarInstance.setBidder(Bidder.address);
  });
};