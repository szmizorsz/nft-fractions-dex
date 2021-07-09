const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const NftFractionsRepository = artifacts.require('NftFractionsRepository');
const MaticNftFractionsRepository = artifacts.require('MaticNftFractionsRepository');

module.exports = async function (deployer, network) {
    switch (network) {
        case "maticMumbai":
            await deployProxy(MaticNftFractionsRepository, ["URI"], { deployer });
            break;
        case "bscTestnet":
            await deployProxy(NftFractionsRepository, ["URI"], { deployer });
            break;
        case "development":
            await deployProxy(MaticNftFractionsRepository, ["URI"], { deployer });
            await deployProxy(NftFractionsRepository, ["URI"], { deployer });
            break;
    }
};