const MaticNftFractionsRepository = artifacts.require("MaticNftFractionsRepository");
const MaticDex = artifacts.require("MaticDex");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const truffleAssert = require("truffle-assertions");

contract("MaticDex eth deposits and withdrawals", async function (accounts) {
    let nftFractionsRepositoryInstance;
    let dexInstance;
    let ethOwner = accounts[8];

    beforeEach(async function () {
        nftFractionsRepositoryInstance = await deployProxy(MaticNftFractionsRepository, ["URI"]);
        dexInstance = await deployProxy(MaticDex, []);
        dexInstance.setNftFractionsRepository(nftFractionsRepositoryInstance.address);
    });

    it("should deposit eth", async function () {
        let amount = 100;
        let result = await dexInstance.depositEth({ from: ethOwner, value: amount });

        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.balance.toNumber() === amount
                && e.account === ethOwner;
        }, 'event params incorrect');
    });

    it("should withdraw eth", async function () {
        let amount = 100;
        let result = await dexInstance.depositEth({ from: ethOwner, value: amount });
        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.balance.toNumber() === amount
                && e.account === ethOwner;
        }, 'event params incorrect');

        result = await dexInstance.withdrawEth(amount, { from: ethOwner });
        truffleAssert.eventEmitted(result, 'EthBalanceChange');
        truffleAssert.eventEmitted(result, 'EthBalanceChange', (e) => {
            return e.balance.toNumber() === 0
                && e.account === ethOwner;
        }, 'event params incorrect');
    });

    it("should not withdraw eth more than the owners balance", async function () {
        let amount = 100;
        await dexInstance.depositEth({ from: ethOwner, value: amount });
        await truffleAssert.reverts(
            dexInstance.withdrawEth(amount + 1, { from: ethOwner }),
            "ETH balance is not enough");
    });
});

