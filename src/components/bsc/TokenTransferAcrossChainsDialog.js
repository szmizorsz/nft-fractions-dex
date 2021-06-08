import React from 'react';
import { GAS_LIMIT } from '../../config/settings.js'
import { TextField, Button } from '@material-ui/core/'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Alert from '@material-ui/lab/Alert';

const TokenTransferAcrossChainsDialog = ({
    erc721ContractAddress,
    erc721TokenId,
    erc1155TokenId,
    ownSharesAmount,
    accounts,
    bscBridgeContract,
    tokenTransferAccrossChainsDialogOpen,
    setTokenTransferAccrossChainsDialogOpen
}) => {
    const defaultDialogContentText = 'Please, specify the amount of shares to transfer to the Matic chain.';
    const [dialogContentText, setDialogContentText] = React.useState(defaultDialogContentText);

    const [amount, setAmount] = React.useState('');

    const handleSubmit = async () => {
        if (parseFloat(amount) > parseFloat(ownSharesAmount)) {
            setDialogContentText(<Alert severity="info">The transfer amount can not exceed the balance!</Alert>);
            return;
        }

        let config = {
            gas: GAS_LIMIT,
            from: accounts[0]
        }
        await bscBridgeContract.methods.burn(accounts[0], erc1155TokenId, amount, erc721ContractAddress, erc721TokenId).send(config);
        handleCloseWithDialogContentTextReset();
    };

    const handleCloseWithDialogContentTextReset = async () => {
        setDialogContentText(defaultDialogContentText);
        setTokenTransferAccrossChainsDialogOpen(false);
        setAmount('');
    };

    return (
        <>
            <Dialog open={tokenTransferAccrossChainsDialogOpen} onClose={handleCloseWithDialogContentTextReset} aria-labelledby="form-dialog-title" disableBackdropClick>
                <DialogTitle id="form-dialog-title">Transfer shares to Matic</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {dialogContentText}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="amount"
                        label="Amount"
                        value={amount}
                        onInput={e => setAmount(e.target.value)}
                        type="number"
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseWithDialogContentTextReset} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => { handleSubmit() }} color="primary">
                        Transfer
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )

}

export default TokenTransferAcrossChainsDialog;
