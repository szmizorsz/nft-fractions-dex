const ERC721Mock = artifacts.require("ERC721Mock");
const MaticNftFractionsRepository = artifacts.require("MaticNftFractionsRepository");
const MaticDex = artifacts.require("MaticDex");
const truffleAssert = require("truffle-assertions");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

contract("MaticDex orders", async function (accounts) {
    let nftFractionsRepositoryInstance;
    let erc721MockInstance;
    let dexInstance;
    let nftOwner = accounts[1];
    let erc721TokenId = 1;
    let fractionsAmount = 100;
    let erc1155TokenId = 1;
    let tokenURI = "tokenURI";

    beforeEach(async function () {
        erc721MockInstance = await ERC721Mock.new();
        await erc721MockInstance.mint(nftOwner, erc721TokenId);
        nftFractionsRepositoryInstance = await deployProxy(MaticNftFractionsRepository, ["URI"]);
        await nftFractionsRepositoryInstance.mint(erc721MockInstance.address, erc721TokenId, erc1155TokenId, fractionsAmount, fractionsAmount, nftOwner, tokenURI);
        dexInstance = await deployProxy(MaticDex, []);
        dexInstance.setNftFractionsRepository(nftFractionsRepositoryInstance.address);
        await nftFractionsRepositoryInstance.setApprovalForAll(dexInstance.address, true, { from: nftOwner });
    });

    it("should create sell limit order", async function () {
        let amount = 50;
        let price = 2;
        let sellSide = 1;
        let result = await dexInstance.createLimitOrder(erc1155TokenId, amount, price, sellSide, { from: nftOwner });

        truffleAssert.eventEmitted(result, 'OrderUpsert');
        truffleAssert.eventEmitted(result, 'OrderUpsert', (e) => {
            return e.orderId.toNumber() === 1
                && e.trader === nftOwner
                && e.side.toNumber() === sellSide
                && e.tokenId.toNumber() === erc1155TokenId
                && e.amount.toNumber() === amount
                && e.filled.toNumber() === 0
                && e.price.toNumber() === price;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange');
        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange', (e) => {
            return e.account === nftOwner
                && e.tokenId.toNumber() === erc1155TokenId
                && e.sharesReservedBalance.toNumber() === amount;
        }, 'event params incorrect');
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
        let result = await dexInstance.depositEth({ from: buyer, value: ethDeposit });

        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === ethDeposit;
        }, 'event params incorrect');

        let amount = 50;
        let price = 2;
        let buySide = 0;
        result = await dexInstance.createLimitOrder(erc1155TokenId, amount, price, buySide, { from: buyer });

        truffleAssert.eventEmitted(result, 'OrderUpsert');
        truffleAssert.eventEmitted(result, 'OrderUpsert', (e) => {
            return e.orderId.toNumber() === 1
                && e.trader === buyer
                && e.side.toNumber() === buySide
                && e.tokenId.toNumber() === erc1155TokenId
                && e.amount.toNumber() === amount
                && e.filled.toNumber() === 0
                && e.price.toNumber() === price;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'EthReservedBalanceChange');
        truffleAssert.eventEmitted(result, 'EthReservedBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === amount * price;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'EthReservedBalanceChange');
        truffleAssert.eventEmitted(result, 'EthReservedBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === amount * price;
        }, 'event params incorrect');
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

    it("should create sell market order and match to one buy limit order", async function () {
        let buyer = accounts[2];
        let ethDeposit = 200;
        let result = await dexInstance.depositEth({ from: buyer, value: ethDeposit });

        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === ethDeposit;
        }, 'event params incorrect');

        let amount = 50;
        let price = 2;
        let buySide = 0;
        result = await dexInstance.createLimitOrder(erc1155TokenId, amount, price, buySide, { from: buyer });

        truffleAssert.eventEmitted(result, 'EthReservedBalanceChange');
        truffleAssert.eventEmitted(result, 'EthReservedBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === amount * price;
        }, 'event params incorrect');

        let sellSide = 1;
        let sellAmount = 40;
        result = await dexInstance.createMarketOrder(erc1155TokenId, sellAmount, sellSide, { from: nftOwner });

        truffleAssert.eventEmitted(result, 'OrderUpsert');
        truffleAssert.eventEmitted(result, 'OrderUpsert', (e) => {
            return e.orderId.toNumber() === 1
                && e.trader === buyer
                && e.side.toNumber() === buySide
                && e.tokenId.toNumber() === erc1155TokenId
                && e.amount.toNumber() === amount
                && e.filled.toNumber() === sellAmount
                && e.price.toNumber() === price;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'NewTrade');
        truffleAssert.eventEmitted(result, 'NewTrade', (e) => {
            return e.orderId.toNumber() === 1
                && e.tokenId.toNumber() === erc1155TokenId
                && e.trader1 === buyer
                && e.trader2 === nftOwner
                && e.amount.toNumber() === sellAmount
                && e.price.toNumber() === price;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'EthReservedBalanceChange');
        truffleAssert.eventEmitted(result, 'EthReservedBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === amount * price - sellAmount * price;
        }, 'event params incorrect');


        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === ethDeposit - sellAmount * price;
        }, 'event params incorrect');


        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.account === nftOwner
                && e.balance.toNumber() === sellAmount * price;
        }, 'event params incorrect');
    });

    it("should create sell market order and match to two buy limit orders", async function () {
        let buyer = accounts[2];
        let ethDeposit = 2000;
        let result = await dexInstance.depositEth({ from: buyer, value: ethDeposit });

        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === ethDeposit;
        }, 'event params incorrect');

        let amount1 = 50;
        let price1 = 3;
        let buySide = 0;
        result = await dexInstance.createLimitOrder(erc1155TokenId, amount1, price1, buySide, { from: buyer });

        truffleAssert.eventEmitted(result, 'EthReservedBalanceChange');
        truffleAssert.eventEmitted(result, 'EthReservedBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === amount1 * price1;
        }, 'event params incorrect');

        let amount2 = 40;
        let price2 = 2;
        result = await dexInstance.createLimitOrder(erc1155TokenId, amount2, price2, buySide, { from: buyer });

        truffleAssert.eventEmitted(result, 'EthReservedBalanceChange');
        truffleAssert.eventEmitted(result, 'EthReservedBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === amount1 * price1 + amount2 * price2;
        }, 'event params incorrect');

        let sellSide = 1;
        let sellAmount = 80;
        result = await dexInstance.createMarketOrder(erc1155TokenId, sellAmount, sellSide, { from: nftOwner });

        truffleAssert.eventEmitted(result, 'OrderUpsert');
        truffleAssert.eventEmitted(result, 'OrderUpsert', (e) => {
            return e.orderId.toNumber() === 1
                && e.trader === buyer
                && e.side.toNumber() === buySide
                && e.tokenId.toNumber() === erc1155TokenId
                && e.amount.toNumber() === amount1
                && e.filled.toNumber() === amount1
                && e.price.toNumber() === price1;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'OrderUpsert');
        truffleAssert.eventEmitted(result, 'OrderUpsert', (e) => {
            return e.orderId.toNumber() === 2
                && e.trader === buyer
                && e.side.toNumber() === buySide
                && e.tokenId.toNumber() === erc1155TokenId
                && e.amount.toNumber() === amount2
                && e.filled.toNumber() === sellAmount - amount1
                && e.price.toNumber() === price2;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'NewTrade');
        truffleAssert.eventEmitted(result, 'NewTrade', (e) => {
            return e.orderId.toNumber() === 1
                && e.tokenId.toNumber() === erc1155TokenId
                && e.trader1 === buyer
                && e.trader2 === nftOwner
                && e.amount.toNumber() === amount1
                && e.price.toNumber() === price1;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'NewTrade', (e) => {
            return e.orderId.toNumber() === 2
                && e.tokenId.toNumber() === erc1155TokenId
                && e.trader1 === buyer
                && e.trader2 === nftOwner
                && e.amount.toNumber() === sellAmount - amount1
                && e.price.toNumber() === price2;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'EthReservedBalanceChange');
        truffleAssert.eventEmitted(result, 'EthReservedBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === amount2 * price2;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === ethDeposit - amount1 * price1;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.account === nftOwner
                && e.balance.toNumber() === amount1 * price1;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'EthReservedBalanceChange');
        truffleAssert.eventEmitted(result, 'EthReservedBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === amount2 * price2 - (sellAmount - amount1) * price2;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === ethDeposit - amount1 * price1 - (sellAmount - amount1) * price2;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.account === nftOwner
                && e.balance.toNumber() === amount1 * price1 + (sellAmount - amount1) * price2;
        }, 'event params incorrect');
    });

    it("should create buy market order and match to one sell limit order", async function () {
        let buyer = accounts[2];
        let ethDeposit = 200;
        let result = await dexInstance.depositEth({ from: buyer, value: ethDeposit });

        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === ethDeposit;
        }, 'event params incorrect');

        let amount = 50;
        let price = 2;
        let sellSide = 1;
        result = await dexInstance.createLimitOrder(erc1155TokenId, amount, price, sellSide, { from: nftOwner });

        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange');
        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange', (e) => {
            return e.account === nftOwner
                && e.tokenId.toNumber() === erc1155TokenId
                && e.sharesReservedBalance.toNumber() === amount;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'OrderUpsert');
        truffleAssert.eventEmitted(result, 'OrderUpsert', (e) => {
            return e.orderId.toNumber() === 1
                && e.trader === nftOwner
                && e.side.toNumber() === sellSide
                && e.tokenId.toNumber() === erc1155TokenId
                && e.amount.toNumber() === amount
                && e.filled.toNumber() === 0
                && e.price.toNumber() === price;
        }, 'event params incorrect');

        let buySide = 0;
        let buyAmount = 40;
        result = await dexInstance.createMarketOrder(erc1155TokenId, buyAmount, buySide, { from: buyer });

        truffleAssert.eventEmitted(result, 'OrderUpsert');
        truffleAssert.eventEmitted(result, 'OrderUpsert', (e) => {
            return e.orderId.toNumber() === 1
                && e.trader === nftOwner
                && e.side.toNumber() === sellSide
                && e.tokenId.toNumber() === erc1155TokenId
                && e.amount.toNumber() === amount
                && e.filled.toNumber() === buyAmount
                && e.price.toNumber() === price;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'NewTrade');
        truffleAssert.eventEmitted(result, 'NewTrade', (e) => {
            return e.orderId.toNumber() === 1
                && e.tokenId.toNumber() === erc1155TokenId
                && e.trader1 === nftOwner
                && e.trader2 === buyer
                && e.amount.toNumber() === buyAmount
                && e.price.toNumber() === price;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange');
        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange', (e) => {
            return e.account === nftOwner
                && e.tokenId.toNumber() === erc1155TokenId
                && e.sharesReservedBalance.toNumber() === amount - buyAmount;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === ethDeposit - buyAmount * price;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.account === nftOwner
                && e.balance.toNumber() === buyAmount * price;
        }, 'event params incorrect');
    });

    it("should create buy market order and match fully to one sell limit order", async function () {
        let buyer = accounts[2];
        let ethDeposit = 200;
        let result = await dexInstance.depositEth({ from: buyer, value: ethDeposit });

        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === ethDeposit;
        }, 'event params incorrect');

        let amount = 50;
        let price = 2;
        let sellSide = 1;
        result = await dexInstance.createLimitOrder(erc1155TokenId, amount, price, sellSide, { from: nftOwner });

        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange');
        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange', (e) => {
            return e.account === nftOwner
                && e.tokenId.toNumber() === erc1155TokenId
                && e.sharesReservedBalance.toNumber() === amount;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'OrderUpsert');
        truffleAssert.eventEmitted(result, 'OrderUpsert', (e) => {
            return e.orderId.toNumber() === 1
                && e.trader === nftOwner
                && e.side.toNumber() === sellSide
                && e.tokenId.toNumber() === erc1155TokenId
                && e.amount.toNumber() === amount
                && e.filled.toNumber() === 0
                && e.price.toNumber() === price;
        }, 'event params incorrect');

        let buySide = 0;
        let buyAmount = 60;
        result = await dexInstance.createMarketOrder(erc1155TokenId, buyAmount, buySide, { from: buyer });

        truffleAssert.eventEmitted(result, 'OrderUpsert');
        truffleAssert.eventEmitted(result, 'OrderUpsert', (e) => {
            return e.orderId.toNumber() === 1
                && e.trader === nftOwner
                && e.side.toNumber() === sellSide
                && e.tokenId.toNumber() === erc1155TokenId
                && e.amount.toNumber() === amount
                && e.filled.toNumber() === amount
                && e.price.toNumber() === price;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'NewTrade');
        truffleAssert.eventEmitted(result, 'NewTrade', (e) => {
            return e.orderId.toNumber() === 1
                && e.tokenId.toNumber() === erc1155TokenId
                && e.trader1 === nftOwner
                && e.trader2 === buyer
                && e.amount.toNumber() === amount
                && e.price.toNumber() === price;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange');
        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange', (e) => {
            return e.account === nftOwner
                && e.tokenId.toNumber() === erc1155TokenId
                && e.sharesReservedBalance.toNumber() === 0;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === ethDeposit - amount * price;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.account === nftOwner
                && e.balance.toNumber() === amount * price;
        }, 'event params incorrect');
    });

    it("should create buy market order and match to two sell limit order", async function () {
        let buyer = accounts[2];
        let ethDeposit = 2000;
        let result = await dexInstance.depositEth({ from: buyer, value: ethDeposit });

        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === ethDeposit;
        }, 'event params incorrect');

        let amount = 50;
        let price = 2;
        let sellSide = 1;
        result = await dexInstance.createLimitOrder(erc1155TokenId, amount, price, sellSide, { from: nftOwner });

        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange');
        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange', (e) => {
            return e.account === nftOwner
                && e.tokenId.toNumber() === erc1155TokenId
                && e.sharesReservedBalance.toNumber() === amount;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'OrderUpsert');
        truffleAssert.eventEmitted(result, 'OrderUpsert', (e) => {
            return e.orderId.toNumber() === 1
                && e.trader === nftOwner
                && e.side.toNumber() === sellSide
                && e.tokenId.toNumber() === erc1155TokenId
                && e.amount.toNumber() === amount
                && e.filled.toNumber() === 0
                && e.price.toNumber() === price;
        }, 'event params incorrect');

        let amount2 = 60;
        let price2 = 3;
        result = await dexInstance.createLimitOrder(erc1155TokenId, amount2, price2, sellSide, { from: nftOwner });

        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange');
        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange', (e) => {
            return e.account === nftOwner
                && e.tokenId.toNumber() === erc1155TokenId
                && e.sharesReservedBalance.toNumber() === amount + amount2;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'OrderUpsert');
        truffleAssert.eventEmitted(result, 'OrderUpsert', (e) => {
            return e.orderId.toNumber() === 2
                && e.trader === nftOwner
                && e.side.toNumber() === sellSide
                && e.tokenId.toNumber() === erc1155TokenId
                && e.amount.toNumber() === amount2
                && e.filled.toNumber() === 0
                && e.price.toNumber() === price2;
        }, 'event params incorrect');

        let buySide = 0;
        let buyAmount = 90;
        result = await dexInstance.createMarketOrder(erc1155TokenId, buyAmount, buySide, { from: buyer });

        truffleAssert.eventEmitted(result, 'OrderUpsert');
        truffleAssert.eventEmitted(result, 'OrderUpsert', (e) => {
            return e.orderId.toNumber() === 1
                && e.trader === nftOwner
                && e.side.toNumber() === sellSide
                && e.tokenId.toNumber() === erc1155TokenId
                && e.amount.toNumber() === amount
                && e.filled.toNumber() === amount
                && e.price.toNumber() === price;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'NewTrade');
        truffleAssert.eventEmitted(result, 'NewTrade', (e) => {
            return e.orderId.toNumber() === 1
                && e.tokenId.toNumber() === erc1155TokenId
                && e.trader1 === nftOwner
                && e.trader2 === buyer
                && e.amount.toNumber() === amount
                && e.price.toNumber() === price;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange');
        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange', (e) => {
            return e.account === nftOwner
                && e.tokenId.toNumber() === erc1155TokenId
                && e.sharesReservedBalance.toNumber() === amount2;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === ethDeposit - amount * price;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.account === nftOwner
                && e.balance.toNumber() === amount * price;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'OrderUpsert');
        truffleAssert.eventEmitted(result, 'OrderUpsert', (e) => {
            return e.orderId.toNumber() === 2
                && e.trader === nftOwner
                && e.side.toNumber() === sellSide
                && e.tokenId.toNumber() === erc1155TokenId
                && e.amount.toNumber() === amount2
                && e.filled.toNumber() === buyAmount - amount
                && e.price.toNumber() === price2;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'NewTrade', (e) => {
            return e.orderId.toNumber() === 2
                && e.tokenId.toNumber() === erc1155TokenId
                && e.trader1 === nftOwner
                && e.trader2 === buyer
                && e.amount.toNumber() === buyAmount - amount
                && e.price.toNumber() === price2;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange');
        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange', (e) => {
            return e.account === nftOwner
                && e.tokenId.toNumber() === erc1155TokenId
                && e.sharesReservedBalance.toNumber() === amount + amount2 - buyAmount;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === ethDeposit - amount * price - (buyAmount - amount) * price2;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.account === nftOwner
                && e.balance.toNumber() === amount * price + (buyAmount - amount) * price2;
        }, 'event params incorrect');
    });

    it("should create buy market order and match fully to one sell limit order which transfers the whole ownership", async function () {
        let buyer = accounts[2];
        let ethDeposit = 200;
        let result = await dexInstance.depositEth({ from: buyer, value: ethDeposit });

        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === ethDeposit;
        }, 'event params incorrect');

        let amount = 100;
        let price = 2;
        let sellSide = 1;
        result = await dexInstance.createLimitOrder(erc1155TokenId, amount, price, sellSide, { from: nftOwner });

        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange');
        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange', (e) => {
            return e.account === nftOwner
                && e.tokenId.toNumber() === erc1155TokenId
                && e.sharesReservedBalance.toNumber() === amount;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'OrderUpsert');
        truffleAssert.eventEmitted(result, 'OrderUpsert', (e) => {
            return e.orderId.toNumber() === 1
                && e.trader === nftOwner
                && e.side.toNumber() === sellSide
                && e.tokenId.toNumber() === erc1155TokenId
                && e.amount.toNumber() === amount
                && e.filled.toNumber() === 0
                && e.price.toNumber() === price;
        }, 'event params incorrect');

        let buySide = 0;
        let buyAmount = 100;
        result = await dexInstance.createMarketOrder(erc1155TokenId, buyAmount, buySide, { from: buyer });

        truffleAssert.eventEmitted(result, 'OrderUpsert');
        truffleAssert.eventEmitted(result, 'OrderUpsert', (e) => {
            return e.orderId.toNumber() === 1
                && e.trader === nftOwner
                && e.side.toNumber() === sellSide
                && e.tokenId.toNumber() === erc1155TokenId
                && e.amount.toNumber() === amount
                && e.filled.toNumber() === amount
                && e.price.toNumber() === price;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'NewTrade');
        truffleAssert.eventEmitted(result, 'NewTrade', (e) => {
            return e.orderId.toNumber() === 1
                && e.tokenId.toNumber() === erc1155TokenId
                && e.trader1 === nftOwner
                && e.trader2 === buyer
                && e.amount.toNumber() === amount
                && e.price.toNumber() === price;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange');
        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange', (e) => {
            return e.account === nftOwner
                && e.tokenId.toNumber() === erc1155TokenId
                && e.sharesReservedBalance.toNumber() === 0;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === ethDeposit - amount * price;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.account === nftOwner
                && e.balance.toNumber() === amount * price;
        }, 'event params incorrect');

        let originalOwnerBalance = await nftFractionsRepositoryInstance.balanceOf(nftOwner, erc1155TokenId);
        assert(originalOwnerBalance.toNumber() === 0);
        let buyerBalance = await nftFractionsRepositoryInstance.balanceOf(buyer, erc1155TokenId);
        assert(buyerBalance.toNumber() === 100);
    });

    it("should delete sell limit order", async function () {
        let amount = 50;
        let price = 2;
        let sellSide = 1;
        let result = await dexInstance.createLimitOrder(erc1155TokenId, amount, price, sellSide, { from: nftOwner });

        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange');
        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange', (e) => {
            return e.account === nftOwner
                && e.tokenId.toNumber() === erc1155TokenId
                && e.sharesReservedBalance.toNumber() === amount;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'OrderUpsert');
        truffleAssert.eventEmitted(result, 'OrderUpsert', (e) => {
            return e.orderId.toNumber() === 1
                && e.trader === nftOwner
                && e.side.toNumber() === sellSide
                && e.tokenId.toNumber() === erc1155TokenId
                && e.amount.toNumber() === amount
                && e.filled.toNumber() === 0
                && e.price.toNumber() === price;
        }, 'event params incorrect');

        let orderIdToDelete = 1;
        result = await dexInstance.deleteOrder(erc1155TokenId, sellSide, orderIdToDelete, { from: nftOwner });

        truffleAssert.eventEmitted(result, 'OrderRemoval');
        truffleAssert.eventEmitted(result, 'OrderRemoval', (e) => {
            return e.orderId.toNumber() === 1;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange');
        truffleAssert.eventEmitted(result, 'SharesReservedBalanceChange', (e) => {
            return e.account === nftOwner
                && e.tokenId.toNumber() === erc1155TokenId
                && e.sharesReservedBalance.toNumber() === 0;
        }, 'event params incorrect');
    });

    it("should delete buy limit order", async function () {
        let buyer = accounts[2];
        let ethDeposit = 200;
        let result = await dexInstance.depositEth({ from: buyer, value: ethDeposit });

        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === ethDeposit;
        }, 'event params incorrect');

        let amount = 50;
        let price = 2;
        let buySide = 0;
        result = await dexInstance.createLimitOrder(erc1155TokenId, amount, price, buySide, { from: buyer });

        truffleAssert.eventEmitted(result, 'EthReservedBalanceChange');
        truffleAssert.eventEmitted(result, 'EthReservedBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === amount * price;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'OrderUpsert');
        truffleAssert.eventEmitted(result, 'OrderUpsert', (e) => {
            return e.orderId.toNumber() === 1
                && e.trader === buyer
                && e.side.toNumber() === buySide
                && e.tokenId.toNumber() === erc1155TokenId
                && e.amount.toNumber() === amount
                && e.filled.toNumber() === 0
                && e.price.toNumber() === price;
        }, 'event params incorrect');

        let orderIdToDelete = 1;
        result = await dexInstance.deleteOrder(erc1155TokenId, buySide, orderIdToDelete, { from: buyer });

        truffleAssert.eventEmitted(result, 'OrderRemoval');
        truffleAssert.eventEmitted(result, 'OrderRemoval', (e) => {
            return e.orderId.toNumber() === 1;
        }, 'event params incorrect');

        truffleAssert.eventEmitted(result, 'EthReservedBalanceChange');
        truffleAssert.eventEmitted(result, 'EthReservedBalanceChange', (e) => {
            return e.account === buyer
                && e.balance.toNumber() === 0;
        }, 'event params incorrect');
    });

    it("should not delete limit order if the sender is not the trader who registered the order", async function () {
        let amount = 50;
        let price = 2;
        let sellSide = 1;
        await dexInstance.createLimitOrder(erc1155TokenId, amount, price, sellSide, { from: nftOwner });
        let amount2 = 60;
        let price2 = 3;
        await dexInstance.createLimitOrder(erc1155TokenId, amount2, price2, sellSide, { from: nftOwner });

        let orderIdToDelete = 1;
        await truffleAssert.reverts(
            dexInstance.deleteOrder(erc1155TokenId, sellSide, orderIdToDelete, { from: accounts[2] }),
            "Only the trader can delete his order");
    });
});
