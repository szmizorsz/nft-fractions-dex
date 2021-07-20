const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const MaticDex = artifacts.require('MaticDex');
const BscDex = artifacts.require('BscDex');
const BscNftFractionsRepository = artifacts.require('BscNftFractionsRepository');
const MaticNftFractionsRepository = artifacts.require('MaticNftFractionsRepository');

module.exports = async function (deployer, network) {
    let bscNftFractionsRepositoryInstance;
    let maticNftFractionsRepositoryInstance;
    let bscDex;
    let maticDex;
    switch (network) {
        case "maticMumbai":
            maticDex = await deployProxy(MaticDex, [], { deployer });
            maticNftFractionsRepositoryInstance = await MaticNftFractionsRepository.deployed();
            await maticDex.setNftFractionsRepository(maticNftFractionsRepositoryInstance.address);
            break;
        case "bscTestnet":
            bscDex = await deployProxy(BscDex, [], { deployer });
            bscNftFractionsRepositoryInstance = await BscNftFractionsRepository.deployed();
            await bscDex.setNftFractionsRepository(bscNftFractionsRepositoryInstance.address);
            break;
        case "development":
            maticDex = await deployProxy(MaticDex, [], { deployer });
            maticNftFractionsRepositoryInstance = await MaticNftFractionsRepository.deployed();
            await maticDex.setNftFractionsRepository(maticNftFractionsRepositoryInstance.address);
            bscDex = await deployProxy(BscDex, [], { deployer });
            bscNftFractionsRepositoryInstance = await BscNftFractionsRepository.deployed();
            await bscDex.setNftFractionsRepository(bscNftFractionsRepositoryInstance.address);
            break;
    }
};