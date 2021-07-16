const ERC721Mock = artifacts.require("ERC721Mock");
const BscNftFractionsRepository = artifacts.require("BscNftFractionsRepository");
const truffleAssert = require("truffle-assertions");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

contract("BSC token transfers", async function (accounts) {
    let nftFractionsRepositoryInstance;
    let erc721MockInstance;
    let nftOwner = accounts[1];
    let erc721TokenId = 1;
    let fractionsAmount = 100;
    let erc1155TokenId = 1;
    let tokenURI = "asdfghjk";

    beforeEach(async function () {
        erc721MockInstance = await ERC721Mock.new();
        await erc721MockInstance.mint(nftOwner, erc721TokenId);
        await erc721MockInstance.setTokenURI(erc721TokenId, tokenURI);

        nftFractionsRepositoryInstance = await deployProxy(BscNftFractionsRepository, ["URI"]);
        await nftFractionsRepositoryInstance.mint(erc721MockInstance.address, erc721TokenId, erc1155TokenId, fractionsAmount, fractionsAmount, nftOwner, tokenURI);
    });

    it("should transfer a part of its shares", async function () {
        let amountToTransfer = 50;
        await nftFractionsRepositoryInstance.burn(erc1155TokenId, amountToTransfer, nftOwner);

        let tokenDataFromNftFractionsRepositoryInstance = await nftFractionsRepositoryInstance.getTokenData(erc1155TokenId);
        assert(tokenDataFromNftFractionsRepositoryInstance.erc721ContractAddress === erc721MockInstance.address);
        assert(tokenDataFromNftFractionsRepositoryInstance.erc721TokenId.toNumber() === erc721TokenId);
        assert(tokenDataFromNftFractionsRepositoryInstance.totalFractionsAmount.toNumber() === fractionsAmount);

        let ownersTokens = await nftFractionsRepositoryInstance.getTokenIdsByShareOwner(nftOwner);
        ownersTokens = ownersTokens.map(item => item.toNumber());
        expect(ownersTokens).to.have.same.members([erc1155TokenId]);

        let ownersByTokenId = await nftFractionsRepositoryInstance.getOwnersBYtokenId(erc1155TokenId);
        expect(ownersByTokenId).to.have.same.members([nftOwner]);

        let allTokens = await nftFractionsRepositoryInstance.getTokenIds();
        allTokens = allTokens.map(item => item.toNumber());
        expect(allTokens).to.have.same.members([erc1155TokenId]);
    });

    it("should transfer all of its shares", async function () {
        let amountToTransfer = 100;
        await nftFractionsRepositoryInstance.burn(erc1155TokenId, amountToTransfer, nftOwner);

        let tokenDataFromNftFractionsRepositoryInstance = await nftFractionsRepositoryInstance.getTokenData(erc1155TokenId);
        assert(tokenDataFromNftFractionsRepositoryInstance.erc721ContractAddress === erc721MockInstance.address);
        assert(tokenDataFromNftFractionsRepositoryInstance.erc721TokenId.toNumber() === erc721TokenId);
        assert(tokenDataFromNftFractionsRepositoryInstance.totalFractionsAmount.toNumber() === fractionsAmount);

        let ownersTokens = await nftFractionsRepositoryInstance.getTokenIdsByShareOwner(nftOwner);
        expect(ownersTokens).to.have.lengthOf(0);

        let allTokens = await nftFractionsRepositoryInstance.getTokenIds();
        allTokens = allTokens.map(item => item.toNumber());
        expect(allTokens).to.have.same.members([erc1155TokenId]);
    });

    it("should not transfer while the contract is paused", async function () {
        await nftFractionsRepositoryInstance.pause();
        let amountToTransfer = 100;
        await truffleAssert.reverts(
            nftFractionsRepositoryInstance.burn(erc1155TokenId, amountToTransfer, nftOwner),
            "Not allowed while paused");
    });

    it("should not transfer more than the balance of the owner", async function () {
        let amountToTransfer = 110;
        await truffleAssert.reverts(
            nftFractionsRepositoryInstance.burn(erc1155TokenId, amountToTransfer, nftOwner),
            "transferer has to own equal or more shares than the given amount");
    });

    it("should mint shares for a token that already exists", async function () {
        let amountToMint = 50;
        await nftFractionsRepositoryInstance.mint(erc721MockInstance.address, erc721TokenId, erc1155TokenId, amountToMint, fractionsAmount, nftOwner, tokenURI);

        let tokenDataFromNftFractionsRepositoryInstance = await nftFractionsRepositoryInstance.getTokenData(erc1155TokenId);
        assert(tokenDataFromNftFractionsRepositoryInstance.erc721ContractAddress === erc721MockInstance.address);
        assert(tokenDataFromNftFractionsRepositoryInstance.erc721TokenId.toNumber() === erc721TokenId);
        assert(tokenDataFromNftFractionsRepositoryInstance.totalFractionsAmount.toNumber() === fractionsAmount);
        assert(tokenDataFromNftFractionsRepositoryInstance.tokenURI === tokenURI);

        let ownersBalance = await nftFractionsRepositoryInstance.balanceOf(nftOwner, erc1155TokenId);
        assert(ownersBalance.toNumber() === fractionsAmount + amountToMint);

        let ownersTokens = await nftFractionsRepositoryInstance.getTokenIdsByShareOwner(nftOwner);
        ownersTokens = ownersTokens.map(item => item.toNumber());
        expect(ownersTokens).to.have.same.members([erc1155TokenId]);

        let ownersByTokenId = await nftFractionsRepositoryInstance.getOwnersBYtokenId(erc1155TokenId);
        expect(ownersByTokenId).to.have.same.members([nftOwner]);

        let allTokens = await nftFractionsRepositoryInstance.getTokenIds();
        allTokens = allTokens.map(item => item.toNumber());
        expect(allTokens).to.have.same.members([erc1155TokenId]);
    });

    it("should mint shares for a token that does not exists on the chain yet", async function () {
        let amountToMint = 50;
        let newErc721TokenId = 2;
        let newErc1155TokenId = 2;
        await nftFractionsRepositoryInstance.mint(erc721MockInstance.address, newErc721TokenId, newErc1155TokenId, amountToMint, fractionsAmount, nftOwner, tokenURI);

        let tokenDataFromNftFractionsRepositoryInstance = await nftFractionsRepositoryInstance.getTokenData(newErc1155TokenId);
        assert(tokenDataFromNftFractionsRepositoryInstance.erc721ContractAddress === erc721MockInstance.address);
        assert(tokenDataFromNftFractionsRepositoryInstance.erc721TokenId.toNumber() === newErc721TokenId);
        assert(tokenDataFromNftFractionsRepositoryInstance.totalFractionsAmount.toNumber() === fractionsAmount);
        assert(tokenDataFromNftFractionsRepositoryInstance.tokenURI === tokenURI);

        let ownersBalance = await nftFractionsRepositoryInstance.balanceOf(nftOwner, newErc1155TokenId);
        assert(ownersBalance.toNumber() === amountToMint);

        let ownersTokens = await nftFractionsRepositoryInstance.getTokenIdsByShareOwner(nftOwner);
        ownersTokens = ownersTokens.map(item => item.toNumber());
        expect(ownersTokens).to.have.same.members([erc1155TokenId, newErc1155TokenId]);

        let ownersByTokenId = await nftFractionsRepositoryInstance.getOwnersBYtokenId(newErc1155TokenId);
        expect(ownersByTokenId).to.have.same.members([nftOwner]);

        let allTokens = await nftFractionsRepositoryInstance.getTokenIds();
        allTokens = allTokens.map(item => item.toNumber());
        expect(allTokens).to.have.same.members([erc1155TokenId, newErc1155TokenId]);
    });

    it("should not mint while the contract is paused", async function () {
        await nftFractionsRepositoryInstance.pause();
        let amountToMint = 100;
        let newErc721TokenId = 2;
        let newErc1155TokenId = 2;
        await truffleAssert.reverts(
            nftFractionsRepositoryInstance.mint(erc721MockInstance.address, newErc721TokenId, newErc1155TokenId, amountToMint, fractionsAmount, nftOwner, tokenURI),
            "Not allowed while paused");
    });

});

