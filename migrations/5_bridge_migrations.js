const NftFractionsRepository = artifacts.require('NftFractionsRepository');
const MaticNftFractionsRepository = artifacts.require('MaticNftFractionsRepository');
const MaticBridge = artifacts.require('MaticBridge');
const BscBridge = artifacts.require('BscBridge');

module.exports = async function (deployer, network) {
    if (network === 'development' || network === 'maticMumbai') {
        const maticNftFractionsRepositoryInstance = await MaticNftFractionsRepository.deployed();
        const maticBridge = await deployer.deploy(MaticBridge);
        await maticBridge.setNftFractionsRepository(maticNftFractionsRepositoryInstance.address);
        await maticNftFractionsRepositoryInstance.transferOwnership(maticBridge.address);
    } else if (network === 'bscTestnet') {
        const nftFractionsRepositoryInstance = await NftFractionsRepository.deployed();
        const bscBridge = await deployer.deploy(BscBridge);
        await bscBridge.setNftFractionsRepository(nftFractionsRepositoryInstance.address);
        await nftFractionsRepositoryInstance.transferOwnership(bscBridge.address);
    }
};
