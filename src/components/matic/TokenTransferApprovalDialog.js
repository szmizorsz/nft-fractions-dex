import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Alert from '@material-ui/lab/Alert';
import TransactionNotification from './TransactionNotification.js';

function TokenTransferApprovalDialog({ open, nftFractionsRepositoryContract, accounts, setTokenTransferDialogOpen, dexContractAddress }) {
    const defaultDialogContentText = 'You have to approve the token transfer, so once your order matches a buy order the tokens will be automatically transferred!';
    const [dialogContentText, setDialogContentText] = React.useState(defaultDialogContentText);
    const [transactionNotificationOpen, setTransactionNotificationOpen] = React.useState(false);
    const [transactionNotificationText, setTransactionNotificationText] = React.useState("");

    const handleApproval = async () => {
        let config = {
            from: accounts[0]
        }
        await nftFractionsRepositoryContract.methods.setApprovalForAll(dexContractAddress, true).send(config)
            .on("transactionHash", function (transactionHash) {
                setTokenTransferDialogOpen(false);
                setTransactionNotificationText("Transaction sent: " + transactionHash);
                setTransactionNotificationOpen(true);
            })
            .on("receipt", function (receipt) {
                setTransactionNotificationText("Transaction has been confirmed");
                setTransactionNotificationOpen(true);
            })
            .on("error", function (error) {
                setTransactionNotificationText("Transaction error: " + error);
                setTransactionNotificationOpen(true);
                setDialogContentText(<Alert severity="error">Transaction has reverted: Please, note that only the seller can approve the token trasnfer!</Alert>)
            });
        handleCloseWithDialogContentTextReset();
    }

    const handleCloseWithDialogContentTextReset = () => {
        setDialogContentText(defaultDialogContentText);
        setTokenTransferDialogOpen(false);
    }

    return (
        <div>
            <Dialog open={open} onClose={handleCloseWithDialogContentTextReset} aria-labelledby="form-dialog-title" disableBackdropClick>
                <DialogTitle id="form-dialog-title">Token transfer approval</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {dialogContentText}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { handleApproval() }} color="primary">
                        Approve
                    </Button>
                </DialogActions>
            </Dialog>
            < TransactionNotification
                open={transactionNotificationOpen}
                text={transactionNotificationText}
                setOpen={setTransactionNotificationOpen}
            />
        </div>
    );
}

export default TokenTransferApprovalDialog;
