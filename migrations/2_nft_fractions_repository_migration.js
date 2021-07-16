const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const BscNftFractionsRepository = artifacts.require('BscNftFractionsRepository');
const MaticNftFractionsRepository = artifacts.require('MaticNftFractionsRepository');

module.exports = async function (deployer, network) {
    switch (network) {
        case "maticMumbai":
            await deployProxy(MaticNftFractionsRepository, ["URI"], { deployer });
            break;
        case "bscTestnet":
            await deployProxy(BscNftFractionsRepository, ["URI"], { deployer });
            break;
        case "development":
            await deployProxy(MaticNftFractionsRepository, ["URI"], { deployer });
            await deployProxy(BscNftFractionsRepository, ["URI"], { deployer });
            break;
    }
};