import React from 'react';
import { TextField, Button } from '@material-ui/core/'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Web3 from 'web3';
import TransactionNotification from './TransactionNotification.js';

const DepositBnbDialog = ({ accounts, dexContract, bnbDepositDialogOpen, setBnbDepositDialogOpen, setBnbBalance }) => {
    const defaultDialogContentText = 'Please, specify the amount (BNB) to deposit.';
    const [dialogContentText] = React.useState(defaultDialogContentText);
    const [transactionNotificationOpen, setTransactionNotificationOpen] = React.useState(false);
    const [transactionNotificationText, setTransactionNotificationText] = React.useState("");
    const [amount, setAmount] = React.useState('');

    const handleSubmit = async () => {
        const weiAmount = Web3.utils.toWei(amount.toString(), 'ether');
        let config = {
            from: accounts[0],
            value: weiAmount
        }
        await dexContract.methods.depositEth().send(config)
            .on("transactionHash", function (transactionHash) {
                setTransactionNotificationText("Transaction sent: " + transactionHash);
                setTransactionNotificationOpen(true);
                setBnbDepositDialogOpen(false);
            })
            .on("receipt", async function (receipt) {
                setTransactionNotificationText("Transaction has been confirmed");
                setTransactionNotificationOpen(true);
                let bnbBalanceFromChain = await dexContract.methods.getEthBalance(accounts[0]).call();
                bnbBalanceFromChain = Web3.utils.fromWei(bnbBalanceFromChain, 'ether');
                setBnbBalance(bnbBalanceFromChain);
            })
            .on("error", function (error) {
                setTransactionNotificationText("Transaction error: " + error);
                setTransactionNotificationOpen(true);
            });
        handleClose();
    };

    const handleClose = () => {
        setBnbDepositDialogOpen(false);
        setAmount('');
    };

    return (
        <>
            <Dialog open={bnbDepositDialogOpen} onClose={handleClose} aria-labelledby="form-dialog-title" disableBackdropClick>
                <DialogTitle id="form-dialog-title">BNB deposit</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {dialogContentText}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="amount"
                        label="Amount (BNB)"
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
            < TransactionNotification
                open={transactionNotificationOpen}
                text={transactionNotificationText}
                setOpen={setTransactionNotificationOpen}
            />
        </>
    )

}

export default DepositBnbDialog;