const Registrar = artifacts.require("Registrar");

module.exports = function (deployer) {
  deployer.deploy(Registrar);
};
