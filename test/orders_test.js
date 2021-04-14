const ERC721Mock = artifacts.require("ERC721Mock");
const NftFractionsRepository = artifacts.require("NftFractionsRepository");
const Dex = artifacts.require("Dex");
const truffleAssert = require("truffle-assertions");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

contract("Dex", async function (accounts) {
    let nftFractionsRepositoryInstance;
    let erc721MockInstance;
    let dexInstance;
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
        dexInstance = await deployProxy(Dex, []);
        dexInstance.setNftFractionsRepository(nftFractionsRepositoryInstance.address);
    });

    it("should create sell limit order", async function () {
        let amount = 50;
        let price = 2;
        let sellSide = 1;
        await dexInstance.createLimitOrder(erc1155TokenId, amount, price, sellSide, { from: nftOwner });
        let orders = await dexInstance.getOrders(erc1155TokenId, sellSide);
        assert(orders[0].id == 1);
        assert(orders[0].amount == amount);
        assert(orders[0].price == price);
        assert(orders[0].side == sellSide);
        assert(orders[0].trader == nftOwner);
        assert(orders[0].tokenId == erc1155TokenId);
        assert(orders[0].filled == 0);
    });

    it("should not create sell limit order with more amount than the sender's balance", async function () {
        let amount = 150;
        let price = 2;
        let sellSide = 1;
        await truffleAssert.reverts(
            dexInstance.createLimitOrder(erc1155TokenId, amount, price, sellSide, { from: nftOwner }),
            "message sender's token balance is too low");
    });

    it("should not create sell limit order for non existing token", async function () {
        let amount = 150;
        let price = 2;
        let sellSide = 1;
        let nonExistingTokenId = 10;
        await truffleAssert.reverts(
            dexInstance.createLimitOrder(nonExistingTokenId, amount, price, sellSide, { from: nftOwner }),
            "this token does not exist");
    });

    it("should create buy limit order", async function () {
        let buyer = accounts[2];
        let ethDeposit = 200;
        await dexInstance.depositEth({ from: buyer, value: ethDeposit });

        let amount = 50;
        let price = 2;
        let buySide = 0;
        await dexInstance.createLimitOrder(erc1155TokenId, amount, price, buySide, { from: buyer });
        let orders = await dexInstance.getOrders(erc1155TokenId, buySide);
        assert(orders[0].id == 1);
        assert(orders[0].amount == amount);
        assert(orders[0].price == price);
        assert(orders[0].side == buySide);
        assert(orders[0].trader == buyer);
        assert(orders[0].tokenId == erc1155TokenId);
        assert(orders[0].filled == 0);
    });

    it("should not create buy limit order for non existing token", async function () {
        let buyer = accounts[2];
        let ethDeposit = 200;
        await dexInstance.depositEth({ from: buyer, value: ethDeposit });

        let amount = 50;
        let price = 2;
        let buySide = 0;
        let nonExistingTokenId = 10;
        await truffleAssert.reverts(
            dexInstance.createLimitOrder(nonExistingTokenId, amount, price, buySide, { from: buyer }),
            "this token does not exist");
    });

    it("should not create buy limit order without sufficient eth balance", async function () {
        let buyer = accounts[2];
        let ethDeposit = 50;
        await dexInstance.depositEth({ from: buyer, value: ethDeposit });

        let amount = 50;
        let price = 2;
        let buySide = 0;
        await truffleAssert.reverts(
            dexInstance.createLimitOrder(erc1155TokenId, amount, price, buySide, { from: buyer }),
            "eth balance too low");
    });

    it("should not create buy limit order for bigger amount than the total fractions", async function () {
        let buyer = accounts[2];
        let ethDeposit = 50;
        await dexInstance.depositEth({ from: buyer, value: ethDeposit });

        let amount = fractionsAmount + 50;
        let price = 2;
        let buySide = 0;
        await truffleAssert.reverts(
            dexInstance.createLimitOrder(erc1155TokenId, amount, price, buySide, { from: buyer }),
            "total amount of fractions is lower than the given amount");
    });
});

