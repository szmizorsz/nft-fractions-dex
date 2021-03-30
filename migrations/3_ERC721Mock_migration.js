const ERC721Mock = artifacts.require("ERC721Mock");

module.exports = async function (deployer) {
    await deployer.deploy(ERC721Mock);
    const erc721MockInstance = await ERC721Mock.deployed();
    const nftOwner = '0xC0F3b367AF79DEd43dBFd8e7026c1b1Db58D7b87';
    const originalNftTokenId = 1;
    await erc721MockInstance.mint(nftOwner, originalNftTokenId);
};