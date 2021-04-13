import React from 'react';
import { GAS_LIMIT } from '../../config/settings.js'
import { TextField, Button } from '@material-ui/core/'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Web3 from 'web3';

const DepositEthDialog = ({ accounts, nftFractionsDexContract, ethDepositDialogOpen, setEthDepositDialogOpen }) => {
    const defaultDialogContentText = 'Please, specify the amount (ETH) to deposit.';
    const [dialogContentText, setDialogContentText] = React.useState(defaultDialogContentText);

    const [amount, setAmount] = React.useState('');

    const handleSubmit = async () => {
        const weiAmount = Web3.utils.toWei(amount.toString(), 'ether');
        let config = {
            gas: GAS_LIMIT,
            from: accounts[0],
            value: weiAmount
        }
        await nftFractionsDexContract.methods.depositEth().send(config);
        handleClose();
    };

    const handleClose = () => {
        setEthDepositDialogOpen(false);
        setAmount('');
    };

    return (
        <>
            <Dialog open={ethDepositDialogOpen} onClose={handleClose} aria-labelledby="form-dialog-title" disableBackdropClick>
                <DialogTitle id="form-dialog-title">ETH deposit</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {dialogContentText}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="amount"
                        label="Amount (ETH)"
                        value={amount}
                        onInput={e => setAmount(e.target.value)}
                        type="number"
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
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

export default DepositEthDialog;