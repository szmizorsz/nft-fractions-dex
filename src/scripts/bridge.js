const Web3 = require('web3');
const BscBridge = require('../contracts/bsc/BscBridge.json');

const web3Bsc = new Web3('wss://data-seed-prebsc-1-s1.binance.org:8545');

const bscBridge = new web3Bsc.eth.Contract(
    BscBridge.abi,
    BscBridge.networks['97'].address
);

setInterval(() => {
    bscBridge.events.Transfer(
        { fromBlock: 0, step: 0 }
    )
        .on('data', event => {
            console.log(event);
        });
}, 10000);

