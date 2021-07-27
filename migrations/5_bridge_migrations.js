const BscNftFractionsRepository = artifacts.require('BscNftFractionsRepository');
const MaticNftFractionsRepository = artifacts.require('MaticNftFractionsRepository');
const MaticBridge = artifacts.require('MaticBridge');
const BscBridge = artifacts.require('BscBridge');

module.exports = async function (deployer, network) {
    let bscNftFractionsRepositoryInstance;
    let maticNftFractionsRepositoryInstance;
    let bscBridge;
    let maticBridge;
    switch (network) {
        case "maticMumbai":
            maticNftFractionsRepositoryInstance = await MaticNftFractionsRepository.deployed();
            maticBridge = await deployer.deploy(MaticBridge);
            await maticBridge.setNftFractionsRepository(maticNftFractionsRepositoryInstance.address);
            await maticNftFractionsRepositoryInstance.transferOwnership(maticBridge.address);
            break;
        case "bscTestnet":
            bscNftFractionsRepositoryInstance = await BscNftFractionsRepository.deployed();
            bscBridge = await deployer.deploy(BscBridge);
            await bscBridge.setNftFractionsRepository(bscNftFractionsRepositoryInstance.address);
            await bscNftFractionsRepositoryInstance.transferOwnership(bscBridge.address);
            break;
        case "development":
            maticNftFractionsRepositoryInstance = await MaticNftFractionsRepository.deployed();
            maticBridge = await deployer.deploy(MaticBridge);
            await maticBridge.setNftFractionsRepository(maticNftFractionsRepositoryInstance.address);
            await maticNftFractionsRepositoryInstance.transferOwnership(maticBridge.address);
            bscNftFractionsRepositoryInstance = await BscNftFractionsRepository.deployed();
            bscBridge = await deployer.deploy(BscBridge);
            await bscBridge.setNftFractionsRepository(bscNftFractionsRepositoryInstance.address);
            await bscNftFractionsRepositoryInstance.transferOwnership(bscBridge.address);
            break;
    }
};
