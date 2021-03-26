const ERC721Mock = artifacts.require("ERC721Mock");

module.exports = function (deployer) {
    deployer.deploy(ERC721Mock);
};