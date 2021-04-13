const NftFractionsDex = artifacts.require("NftFractionsDex");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const truffleAssert = require("truffle-assertions");

contract("NftFractionsDex", async function (accounts) {
    let nftFractionsDexInstance;
    let ethOwner = accounts[8];

    beforeEach(async function () {
        nftFractionsDexInstance = await deployProxy(NftFractionsDex, ["URI"]);
    });

    it("should deposit eth", async function () {
        let amount = 100;
        await nftFractionsDexInstance.depositEth({ from: ethOwner, value: amount });
        let ownerBalance = await nftFractionsDexInstance.getEthBalance(ethOwner);
        assert(ownerBalance.toNumber() === amount);
    });

    it("should withdraw eth", async function () {
        let amount = 100;
        await nftFractionsDexInstance.depositEth({ from: ethOwner, value: amount });
        let ownerBalance = await nftFractionsDexInstance.getEthBalance(ethOwner);
        assert(ownerBalance.toNumber() === amount);
        await nftFractionsDexInstance.withdrawEth(amount, { from: ethOwner });
        ownerBalance = await nftFractionsDexInstance.getEthBalance(ethOwner);
        assert(ownerBalance.toNumber() === 0);
    });

    it("should not withdraw eth more than the owners balance", async function () {
        let amount = 100;
        await nftFractionsDexInstance.depositEth({ from: ethOwner, value: amount });
        let ownerBalance = await nftFractionsDexInstance.getEthBalance(ethOwner);
        assert(ownerBalance.toNumber() === amount);
        await truffleAssert.reverts(
            nftFractionsDexInstance.withdrawEth(amount + 1, { from: ethOwner }),
            "ETH balance is not enough");
    });
});

