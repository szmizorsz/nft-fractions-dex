const ERC721Mock = artifacts.require("ERC721Mock");
const NftFractionsRepository = artifacts.require("NftFractionsRepository");
const MaticBridge = artifacts.require("MaticBridge");
const truffleAssert = require("truffle-assertions");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

contract("Bridge tests", async function (accounts) {
    let nftFractionsRepositoryInstance;
    let erc721MockInstance;
    let bridgeInstance;
    let nftOwner = accounts[1];
    let erc721TokenId = 1;
    let fractionsAmount = 100;
    let erc1155TokenId = 1;

    beforeEach(async function () {
        erc721MockInstance = await ERC721Mock.new();
        await erc721MockInstance.mint(nftOwner, erc721TokenId);

        nftFractionsRepositoryInstance = await deployProxy(NftFractionsRepository, ["URI"]);
        await erc721MockInstance.approve(nftFractionsRepositoryInstance.address, erc721TokenId, { from: nftOwner });
        await nftFractionsRepositoryInstance.depositNft(erc721MockInstance.address, erc721TokenId, fractionsAmount, { from: nftOwner });

        bridgeInstance = await MaticBridge.new();
        await bridgeInstance.setNftFractionsRepository(nftFractionsRepositoryInstance.address);
        await nftFractionsRepositoryInstance.transferOwnership(bridgeInstance.address);
    });

    it("should burn a part of its shares", async function () {
        let amountToTransfer = 50;
        result = await bridgeInstance.burn(nftOwner, erc1155TokenId, amountToTransfer, erc721MockInstance.address, erc721TokenId, { from: nftOwner });

        truffleAssert.eventEmitted(result, 'Transfer');
        truffleAssert.eventEmitted(result, 'Transfer', (e) => {
            return e.from === nftOwner
                && e.to === nftOwner
                && e.erc1155TokenId.toNumber() === erc1155TokenId
                && e.erc1155Amount.toNumber() === amountToTransfer
                && e.erc721ContractAddress === erc721MockInstance.address
                && e.erc721TokenId.toNumber() === erc721TokenId
                && e.nonce.toNumber() === 0
                && e.step.toNumber() === 0;
        }, 'event params incorrect');

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

    it("should burn all of its shares", async function () {
        let amountToTransfer = 100;

        result = await bridgeInstance.burn(nftOwner, erc1155TokenId, amountToTransfer, erc721MockInstance.address, erc721TokenId, { from: nftOwner });

        truffleAssert.eventEmitted(result, 'Transfer');
        truffleAssert.eventEmitted(result, 'Transfer', (e) => {
            return e.from === nftOwner
                && e.to === nftOwner
                && e.erc1155TokenId.toNumber() === erc1155TokenId
                && e.erc1155Amount.toNumber() === amountToTransfer
                && e.erc721ContractAddress === erc721MockInstance.address
                && e.erc721TokenId.toNumber() === erc721TokenId
                && e.nonce.toNumber() === 0
                && e.step.toNumber() === 0;
        }, 'event params incorrect');

        let tokenDataFromNftFractionsRepositoryInstance = await nftFractionsRepositoryInstance.getTokenData(erc1155TokenId);
        assert(tokenDataFromNftFractionsRepositoryInstance.erc721ContractAddress === '0x0000000000000000000000000000000000000000');

        let ownersTokens = await nftFractionsRepositoryInstance.getTokenIdsByShareOwner(nftOwner);
        expect(ownersTokens).to.have.lengthOf(0);

        let allTokens = await nftFractionsRepositoryInstance.getTokenIds();
        expect(allTokens).to.have.lengthOf(0);
    });

    it("should not burn while the contract is paused", async function () {
        await bridgeInstance.pause();
        let amountToTransfer = 100;
        await truffleAssert.reverts(
            bridgeInstance.burn(nftOwner, erc1155TokenId, amountToTransfer, erc721MockInstance.address, erc721TokenId, { from: nftOwner }),
            "Not allowed while paused");
    });

    it("should not burn more than the balance of the owner", async function () {
        let amountToTransfer = 110;
        await truffleAssert.reverts(
            bridgeInstance.burn(nftOwner, erc1155TokenId, amountToTransfer, erc721MockInstance.address, erc721TokenId, { from: nftOwner }),
            "message sender's token balance is too low");
    });

    it("should mint shares for a token that already exists", async function () {
        let amountToMint = 50;
        let otherChainNonce = 0;
        result = await bridgeInstance.mint(nftOwner, nftOwner, erc721MockInstance.address, erc721TokenId, erc1155TokenId, amountToMint, otherChainNonce);

        truffleAssert.eventEmitted(result, 'Transfer');
        truffleAssert.eventEmitted(result, 'Transfer', (e) => {
            return e.from === nftOwner
                && e.to === nftOwner
                && e.erc1155TokenId.toNumber() === erc1155TokenId
                && e.erc1155Amount.toNumber() === amountToMint
                && e.erc721ContractAddress === erc721MockInstance.address
                && e.erc721TokenId.toNumber() === erc721TokenId
                && e.nonce.toNumber() === otherChainNonce
                && e.step.toNumber() === 1;
        }, 'event params incorrect');

        let tokenDataFromNftFractionsRepositoryInstance = await nftFractionsRepositoryInstance.getTokenData(erc1155TokenId);
        assert(tokenDataFromNftFractionsRepositoryInstance.erc721ContractAddress === erc721MockInstance.address);
        assert(tokenDataFromNftFractionsRepositoryInstance.erc721TokenId.toNumber() === erc721TokenId);
        assert(tokenDataFromNftFractionsRepositoryInstance.totalFractionsAmount.toNumber() === fractionsAmount);

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
        let otherChainNonce = 0;
        result = await bridgeInstance.mint(nftOwner, nftOwner, erc721MockInstance.address, newErc721TokenId, newErc1155TokenId, amountToMint, otherChainNonce);

        truffleAssert.eventEmitted(result, 'Transfer');
        truffleAssert.eventEmitted(result, 'Transfer', (e) => {
            return e.from === nftOwner
                && e.to === nftOwner
                && e.erc1155TokenId.toNumber() === newErc1155TokenId
                && e.erc1155Amount.toNumber() === amountToMint
                && e.erc721ContractAddress === erc721MockInstance.address
                && e.erc721TokenId.toNumber() === newErc721TokenId
                && e.nonce.toNumber() === otherChainNonce
                && e.step.toNumber() === 1;
        }, 'event params incorrect');

        let tokenDataFromNftFractionsRepositoryInstance = await nftFractionsRepositoryInstance.getTokenData(newErc1155TokenId);
        assert(tokenDataFromNftFractionsRepositoryInstance.erc721ContractAddress === erc721MockInstance.address);
        assert(tokenDataFromNftFractionsRepositoryInstance.erc721TokenId.toNumber() === newErc721TokenId);
        assert(tokenDataFromNftFractionsRepositoryInstance.totalFractionsAmount.toNumber() === amountToMint);

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
        await bridgeInstance.pause();
        let amountToMint = 100;
        let otherChainNonce = 0;
        await truffleAssert.reverts(
            bridgeInstance.mint(nftOwner, nftOwner, erc721MockInstance.address, erc721TokenId, erc1155TokenId, amountToMint, otherChainNonce),
            "Not allowed while paused");
    });

});

