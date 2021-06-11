import React from 'react';
import { GAS_LIMIT } from '../../config/settings.js'
import { TextField, Button } from '@material-ui/core/'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import BscBridge from '../../contracts/bsc/BscBridge.json';

const DepositNft = ({ web3, accounts, nftFractionsRepositoryContract, nftDepositDialogOpen, setNftDepositDialogOpen }) => {
    const defaultDialogContentText = 'Please, specify the contract address and the token id of your NFT along with the amount of shares that you want to create! Before the deposit the system will ask your allowance to transfer the NFT.';
    const [dialogContentText, setDialogContentText] = React.useState(defaultDialogContentText);

    const [from, setFrom] = React.useState('');
    const [to, setTo] = React.useState('');
    const [erc1155TokenId, setErc1155TokenId] = React.useState('');
    const [erc1155Amount, setErc1155Amount] = React.useState('');
    const [erc721ContractAddress, setErc721ContractAddress] = React.useState('');
    const [erc721TokenId, setErc721TokenId] = React.useState('');
    const [totalFractionsAmount, setTotalFractionsAmount] = React.useState('');
    const [tokenURI, setTokenURI] = React.useState('');
    const [otherChainNonce, setOtherChainNonce] = React.useState('');

    const handleSubmit = async () => {
        let config = {
            gas: GAS_LIMIT,
            from: accounts[0]
        }
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = BscBridge.networks[networkId];
        const bscBridge = new web3.eth.Contract(
            BscBridge.abi,
            deployedNetwork && deployedNetwork.address,
        );
        await bscBridge.methods.mint(from, to, erc721ContractAddress, erc721TokenId, erc1155TokenId, erc1155Amount, totalFractionsAmount, otherChainNonce, tokenURI).send(config);

        handleCloseWithDialogContentTextReset();
    };

    const handleCloseWithDialogContentTextReset = async () => {
        setFrom('');
        setTo('');
        setErc1155TokenId('');
        setErc1155Amount('');
        setErc721TokenId('');
        setErc721ContractAddress('');
        setTotalFractionsAmount('');
        setTokenURI('');
        setOtherChainNonce('');
        setDialogContentText(defaultDialogContentText);
        setNftDepositDialogOpen(false);
    };

    return (
        <>
            <Dialog open={nftDepositDialogOpen} onClose={handleCloseWithDialogContentTextReset} aria-labelledby="form-dialog-title" disableBackdropClick>
                <DialogTitle id="form-dialog-title">NFT deposit</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {dialogContentText}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="from"
                        label="from"
                        value={from}
                        onInput={e => setFrom(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="to"
                        label="to"
                        value={to}
                        onInput={e => setTo(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="erc1155TokenId"
                        label="erc1155TokenId"
                        value={erc1155TokenId}
                        onInput={e => setErc1155TokenId(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="erc1155Amount"
                        label="erc1155Amount"
                        value={erc1155Amount}
                        onInput={e => setErc1155Amount(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="erc721ContractAddress"
                        label="erc721ContractAddress"
                        value={erc721ContractAddress}
                        onInput={e => setErc721ContractAddress(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="erc721TokenId"
                        label="erc721TokenId"
                        value={erc721TokenId}
                        onInput={e => setErc721TokenId(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="totalFractionsAmount"
                        label="totalFractionsAmount"
                        value={totalFractionsAmount}
                        onInput={e => setTotalFractionsAmount(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="tokenURI"
                        label="tokenURI"
                        value={tokenURI}
                        onInput={e => setTokenURI(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="otherChainNonce"
                        label="otherChainNonce"
                        value={otherChainNonce}
                        onInput={e => setOtherChainNonce(e.target.value)}
                        type="number"
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseWithDialogContentTextReset} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => { handleSubmit() }} color="primary">
                        Deposit
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )

}

export default DepositNft;