const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const NftFractionsDex = artifacts.require('NftFractionsDex');

module.exports = async function (deployer) {
    const instance = await deployProxy(NftFractionsDex, ["URI"], { deployer });
    //console.log('Deployed', instance.address);
};