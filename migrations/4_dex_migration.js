const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const Dex = artifacts.require('Dex');
const BscNftFractionsRepository = artifacts.require('BscNftFractionsRepository');
const MaticNftFractionsRepository = artifacts.require('MaticNftFractionsRepository');

module.exports = async function (deployer, network) {
    let bscNftFractionsRepositoryInstance;
    let maticNftFractionsRepositoryInstance;
    const instance = await deployProxy(Dex, [], { deployer });
    switch (network) {
        case "maticMumbai":
            maticNftFractionsRepositoryInstance = await MaticNftFractionsRepository.deployed();
            await instance.setNftFractionsRepository(maticNftFractionsRepositoryInstance.address);
            break;
        case "bscTestnet":
            bscNftFractionsRepositoryInstance = await BscNftFractionsRepository.deployed();
            await instance.setNftFractionsRepository(bscNftFractionsRepositoryInstance.address);
            break;
        case "development":
            bscNftFractionsRepositoryInstance = await BscNftFractionsRepository.deployed();
            await instance.setNftFractionsRepository(bscNftFractionsRepositoryInstance.address);
            break;
    }
};