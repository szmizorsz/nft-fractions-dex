const ERC721Mock = artifacts.require("ERC721Mock");
const NftFractionsDex = artifacts.require("NftFractionsDex");
const truffleAssert = require("truffle-assertions");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

contract("NftFractionsDex", async function (accounts) {
	let nftFractionsDexInstance;
	let erc721MockInstance;
	let nftOwner = accounts[1];
	let originalNftTokenId = 1;
	let fractionsAmount = 100;

	beforeEach(async function () {
		erc721MockInstance = await ERC721Mock.new();
		await erc721MockInstance.mint(nftOwner, originalNftTokenId);
		nftFractionsDexInstance = await deployProxy(NftFractionsDex, ["URI"]);
		await erc721MockInstance.approve(nftFractionsDexInstance.address, originalNftTokenId, { from: nftOwner });
	});

	it("should deposit the nft token", async function () {
		await nftFractionsDexInstance.depositNft(erc721MockInstance.address, originalNftTokenId, fractionsAmount, { from: nftOwner });
		let newNftOwnerInOriginalContract = await erc721MockInstance.ownerOf(originalNftTokenId);
		assert(newNftOwnerInOriginalContract === nftFractionsDexInstance.address);
		let tokenDataFromNftFractionsDexInstance = await nftFractionsDexInstance.getTokenData(1);
		assert(tokenDataFromNftFractionsDexInstance.originalContract === erc721MockInstance.address);
		assert(tokenDataFromNftFractionsDexInstance.originalTokenId.toNumber() === originalNftTokenId);
		assert(tokenDataFromNftFractionsDexInstance.fractionsAmount.toNumber() === fractionsAmount);
	});

	it("should not deposit the nft token if not the onwer sends", async function () {
		let notNftOwner = accounts[2];
		await truffleAssert.reverts(
			nftFractionsDexInstance.depositNft(erc721MockInstance.address, originalNftTokenId, fractionsAmount, { from: notNftOwner }),
			"msg sender has to own the token to deposit");
	});

	it("should not deposit the nft token while the contract is paused", async function () {
		await nftFractionsDexInstance.pause();
		await truffleAssert.reverts(
			nftFractionsDexInstance.depositNft(erc721MockInstance.address, originalNftTokenId, fractionsAmount, { from: nftOwner }),
			"Not allowed while paused");
	});

});