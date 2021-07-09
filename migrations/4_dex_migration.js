const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const Dex = artifacts.require('Dex');
const NftFractionsRepository = artifacts.require('NftFractionsRepository');
const MaticNftFractionsRepository = artifacts.require('MaticNftFractionsRepository');

module.exports = async function (deployer, network) {
    let nftFractionsRepositoryInstance;
    let maticNftFractionsRepositoryInstance;
    const instance = await deployProxy(Dex, [], { deployer });
    switch (network) {
        case "maticMumbai":
            maticNftFractionsRepositoryInstance = await MaticNftFractionsRepository.deployed();
            await instance.setNftFractionsRepository(maticNftFractionsRepositoryInstance.address);
            break;
        case "bscTestnet":
            nftFractionsRepositoryInstance = await NftFractionsRepository.deployed();
            await instance.setNftFractionsRepository(nftFractionsRepositoryInstance.address);
            break;
        case "development":
            nftFractionsRepositoryInstance = await NftFractionsRepository.deployed();
            await instance.setNftFractionsRepository(nftFractionsRepositoryInstance.address);
            break;
    }
};