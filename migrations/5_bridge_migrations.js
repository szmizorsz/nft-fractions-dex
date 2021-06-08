const NftFractionsRepository = artifacts.require('NftFractionsRepository');
const MaticBridge = artifacts.require('MaticBridge');
const BscBridge = artifacts.require('BscBridge');

module.exports = async function (deployer, network) {
    const nftFractionsRepositoryInstance = await NftFractionsRepository.deployed();
    if (network === 'development' || network === 'maticMumbai') {
        const maticBridge = await deployer.deploy(MaticBridge);
        await maticBridge.setNftFractionsRepository(nftFractionsRepositoryInstance.address);
        await nftFractionsRepositoryInstance.transferOwnership(maticBridge.address);
    } else if (network === 'bscTestnet') {
        const bscBridge = await deployer.deploy(BscBridge);
        await bscBridge.setNftFractionsRepository(nftFractionsRepositoryInstance.address);
        await nftFractionsRepositoryInstance.transferOwnership(bscBridge.address);
    }
};
