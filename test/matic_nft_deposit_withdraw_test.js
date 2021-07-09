const ERC721Mock = artifacts.require("ERC721Mock");
const MaticNftFractionsRepository = artifacts.require("MaticNftFractionsRepository");
const truffleAssert = require("truffle-assertions");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

contract("MaticNftFractionsRepository", async function (accounts) {
    let nftFractionsRepositoryInstance;
    let erc721MockInstance;
    let nftOwner = accounts[1];
    let erc721TokenId = 1;
    let fractionsAmount = 100;

    beforeEach(async function () {
        erc721MockInstance = await ERC721Mock.new();
        await erc721MockInstance.mint(nftOwner, erc721TokenId);
        await erc721MockInstance.setTokenURI(erc721TokenId, "tokenURI");
        nftFractionsRepositoryInstance = await deployProxy(MaticNftFractionsRepository, ["URI"]);
        await erc721MockInstance.approve(nftFractionsRepositoryInstance.address, erc721TokenId, { from: nftOwner });
    });

    it("should deposit the nft token", async function () {
        let result = await nftFractionsRepositoryInstance.depositNft(erc721MockInstance.address, erc721TokenId, fractionsAmount, { from: nftOwner });
        let newNftOwnerInOriginalContract = await erc721MockInstance.ownerOf(erc721TokenId);
        assert(newNftOwnerInOriginalContract === nftFractionsRepositoryInstance.address);
        let tokenDataFromNftFractionsRepositoryInstance = await nftFractionsRepositoryInstance.getTokenData(1);
        assert(tokenDataFromNftFractionsRepositoryInstance.erc721ContractAddress === erc721MockInstance.address);
        assert(tokenDataFromNftFractionsRepositoryInstance.erc721TokenId.toNumber() === erc721TokenId);
        assert(tokenDataFromNftFractionsRepositoryInstance.totalFractionsAmount.toNumber() === fractionsAmount);
        assert(tokenDataFromNftFractionsRepositoryInstance.tokenURI === "tokenURI");

        truffleAssert.eventEmitted(result, 'DepositNft');
        truffleAssert.eventEmitted(result, 'DepositNft', (e) => {
            return e.erc1155TokenId.toNumber() === 1
                && e.erc721TokenId.toNumber() === erc721TokenId
                && e.erc721ContractAddress === erc721MockInstance.address
                && e.tokenURI === "tokenURI"
                && e.totalFractionsAmount.toNumber() === fractionsAmount;
        }, 'event params incorrect');
    });

    it("should not deposit the nft token if not the onwer sends", async function () {
        let notNftOwner = accounts[2];
        await truffleAssert.reverts(
            nftFractionsRepositoryInstance.depositNft(erc721MockInstance.address, erc721TokenId, fractionsAmount, { from: notNftOwner }),
            "msg sender has to own the token to deposit");
    });

    it("should not deposit the nft token while the contract is paused", async function () {
        await nftFractionsRepositoryInstance.pause();
        await truffleAssert.reverts(
            nftFractionsRepositoryInstance.depositNft(erc721MockInstance.address, erc721TokenId, fractionsAmount, { from: nftOwner }),
            "Not allowed while paused");
    });

    it("should withdraw the nft token", async function () {
        await nftFractionsRepositoryInstance.depositNft(erc721MockInstance.address, erc721TokenId, fractionsAmount, { from: nftOwner });
        let erc721TokenId2 = 2;
        await erc721MockInstance.mint(nftOwner, erc721TokenId2);
        await erc721MockInstance.approve(nftFractionsRepositoryInstance.address, erc721TokenId2, { from: nftOwner });
        await nftFractionsRepositoryInstance.depositNft(erc721MockInstance.address, erc721TokenId2, fractionsAmount, { from: nftOwner });

        let erc1155tokenIdToWithdraw = 1;
        let result = await nftFractionsRepositoryInstance.withdrawNft(erc1155tokenIdToWithdraw, { from: nftOwner });

        let ownerAfterWithdraw = await erc721MockInstance.ownerOf(erc721TokenId);
        assert(ownerAfterWithdraw === nftOwner);

        let erc1155Balance = await nftFractionsRepositoryInstance.balanceOf(nftOwner, erc1155tokenIdToWithdraw);
        assert(erc1155Balance.toNumber() === 0);

        let deletedTokenData = await nftFractionsRepositoryInstance.getTokenData(erc1155tokenIdToWithdraw);
        assert(deletedTokenData.erc721ContractAddress === "0x0000000000000000000000000000000000000000");
        assert(deletedTokenData.erc721TokenId.toNumber() === 0);
        assert(deletedTokenData.totalFractionsAmount.toNumber() === 0);

        truffleAssert.eventEmitted(result, 'WithdrawNft');
        truffleAssert.eventEmitted(result, 'WithdrawNft', (e) => {
            return e.erc1155TokenId.toNumber() === 1
                && e.erc721TokenId.toNumber() === erc721TokenId
                && e.erc721ContractAddress === erc721MockInstance.address;
        }, 'event params incorrect');
    });

    it("should not withdraw the nft token while the contract is paused", async function () {
        await nftFractionsRepositoryInstance.pause();
        let erc1155tokenId = 1;
        await truffleAssert.reverts(
            nftFractionsRepositoryInstance.withdrawNft(erc1155tokenId, { from: nftOwner }),
            "Not allowed while paused");
    });

    it("should not withdraw the nft token if the sender does not own all shares", async function () {
        await nftFractionsRepositoryInstance.depositNft(erc721MockInstance.address, erc721TokenId, fractionsAmount, { from: nftOwner });
        let erc1155tokenId = 1;
        let notNFTowner = accounts[2];
        await truffleAssert.reverts(
            nftFractionsRepositoryInstance.withdrawNft(erc1155tokenId, { from: notNFTowner }),
            "message sender has to own all of the shares");
    });
});

