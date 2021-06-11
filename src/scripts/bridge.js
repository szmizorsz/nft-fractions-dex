const Web3 = require('web3');
const BscBridge = require('../contracts/bsc/BscBridge.json');
const MaticBridge = require('../contracts/matic/MaticBridge.json');

const web3Bsc = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545');
const web3Matic = new Web3('https://rpc-mumbai.matic.today');

const fs = require('fs');
const adminPrivKey = fs.readFileSync(".admin_key").toString().trim();
const { address: admin } = web3Bsc.eth.accounts.wallet.add(adminPrivKey);

web3Matic.eth.accounts.wallet.add(adminPrivKey);

const bscBridge = new web3Bsc.eth.Contract(
    BscBridge.abi,
    BscBridge.networks['97'].address
);
const maticBridge = new web3Matic.eth.Contract(
    MaticBridge.abi,
    MaticBridge.networks['80001'].address
);

let lastProcessedMaticBlockHeight = fs.readFileSync(".last_processed_matic_block_number").toString().trim();
let lastProcessedMaticNonce = fs.readFileSync(".last_processed_matic_nonce").toString().trim();

const pollMatic = async (blockHeight) => {
    console.log("Matic chain poll starts from block: " + lastProcessedMaticBlockHeight);
    const transferEvents = await maticBridge.getPastEvents(
        'Transfer',
        { fromBlock: lastProcessedMaticBlockHeight, step: 0 }
    );
    for (transferEvent of transferEvents) {
        const { from, to, erc1155TokenId, erc1155Amount, totalFractionsAmount, erc721ContractAddress, erc721TokenId, tokenURI, date, nonce, step } = transferEvent.returnValues;
        console.log(`
        Transfer event from Matic to process:
        - from ${from} 
        - to ${to} 
        - erc1155TokenId ${erc1155TokenId}
        - erc1155Amount ${erc1155Amount}
        - erc721ContractAddress ${erc721ContractAddress}
        - erc721TokenId ${erc721TokenId}
        - totalFractionsAmount ${totalFractionsAmount}
        - tokenURI ${tokenURI}
        - date ${date}
        - nonce ${nonce}
        - step ${step}
      `);
        if (step == 0 && nonce > lastProcessedMaticNonce) {
            const tx = bscBridge.methods.mint(from, to, erc721ContractAddress, erc721TokenId, erc1155TokenId, erc1155Amount, totalFractionsAmount, nonce, tokenURI);
            const [gasPrice, gasCost] = await Promise.all([
                web3Bsc.eth.getGasPrice(),
                tx.estimateGas({ from: admin }),
            ]);
            gasPriceIncreased = 1.1 * gasPrice;
            const data = tx.encodeABI();
            const txData = {
                from: admin,
                to: bscBridge.options.address,
                data,
                gas: gasCost,
                gasPriceIncreased
            };
            web3Bsc.eth.sendTransaction(txData)
                .on('receipt', function (receipt) {
                    console.log(`Transaction hash sent to Bsc to mint: ${receipt.transactionHash}`);
                })
                .on('error', function (error) {
                    console.log("Bsc transaction error: " + error);
                });
            lastProcessedMaticNonce = nonce;
        }
    }
    lastProcessedMaticBlockHeight = blockHeight;
    fs.writeFile('.last_processed_matic_block_number', lastProcessedMaticBlockHeight.toString(), err => {
        if (err) {
            console.error(err)
            return
        }
    })
    fs.writeFile('.last_processed_matic_nonce', lastProcessedMaticNonce.toString(), err => {
        if (err) {
            console.error(err)
            return
        }
    })
}

setInterval(() => {
    web3Matic.eth.getBlockNumber().then(blockNumber => {
        pollMatic(blockNumber);
    })
        .catch(error => console.log(error.message));
}, 60000);

