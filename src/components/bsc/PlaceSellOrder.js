import React from 'react';
import { TextField, Button } from '@material-ui/core/'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box';
import TransactionNotification from './TransactionNotification.js';

const PlaceSellOrder = ({
    web3,
    tokenId,
    accounts,
    dexContract,
    placeSellOrderDialogOpen,
    setPlaceSellOrderDialogOpen,
    buyOrderAvailable,
    sharesAvailableForSelling,
    setTokenTransferDialogOpen,
    setSellOrders
}) => {
    const [amount, setAmount] = React.useState('');
    const [price, setPrice] = React.useState('');
    const [marketPerLimit, setMarketPerLimit] = React.useState('limit');
    const defaultDialogContentText = 'Please, specify the order type, the amount and the price in case of limit orders! ';
    const [dialogContentText, setDialogContentText] = React.useState(defaultDialogContentText);
    const [transactionNotificationOpen, setTransactionNotificationOpen] = React.useState(false);
    const [transactionNotificationText, setTransactionNotificationText] = React.useState("");

    const handleSubmit = async () => {
        if (marketPerLimit === 'limit' && (price === '' || price < 0)) {
            setDialogContentText('Please, set a positive price!');
            return;
        }
        if (amount === '' || amount < 0) {
            setDialogContentText('Please, set a positive amount!');
            return;
        }
        if (amount > sharesAvailableForSelling) {
            setDialogContentText('Amount is higher then your available shares!');
            return;
        }
        if (marketPerLimit === 'market' && buyOrderAvailable === false) {
            setDialogContentText('There is no sell order to match against');
            return;
        }
        let config = {
            from: accounts[0]
        }
        if (marketPerLimit === 'market') {
            await dexContract.methods.createMarketOrder(tokenId, amount, 1).send(config)
                .on("transactionHash", function (transactionHash) {
                    setPlaceSellOrderDialogOpen(false);
                    setTransactionNotificationText("Transaction sent: " + transactionHash);
                    setTransactionNotificationOpen(true);
                })
                .on("receipt", async function (receipt) {
                    setTransactionNotificationText("Transaction has been confirmed");
                    setTransactionNotificationOpen(true);
                    window.location.reload();
                })
                .on("error", function (error) {
                    setTransactionNotificationText("Transaction error: " + error);
                    setTransactionNotificationOpen(true);
                });
        } else {
            const weiPrice = web3.utils.toWei(price.toString(), 'ether');
            await dexContract.methods.createLimitOrder(tokenId, amount, weiPrice, 1).send(config)
                .on("transactionHash", function (transactionHash) {
                    setPlaceSellOrderDialogOpen(false);
                    setTransactionNotificationText("Transaction sent: " + transactionHash);
                    setTransactionNotificationOpen(true);
                })
                .on("receipt", async function (receipt) {
                    setTransactionNotificationText("Transaction has been confirmed");
                    setTransactionNotificationOpen(true);
                    const sellOrdersFromChain = await dexContract.methods.getOrders(tokenId, 1).call();
                    const sellOrdersExtended = sellOrdersFromChain.map((item) => ({
                        ...item,
                        ethPrice: web3.utils.fromWei(item.price, 'ether')
                    }));
                    setSellOrders(sellOrdersExtended);
                })
                .on("error", function (error) {
                    setTransactionNotificationText("Transaction error: " + error);
                    setTransactionNotificationOpen(true);
                });
            setTokenTransferDialogOpen(true);
        }

        handleClose();
    };

    const handleClose = async () => {
        setAmount('');
        setPrice('');
        setDialogContentText(defaultDialogContentText);
        setPlaceSellOrderDialogOpen(false);
    };

    const handleRadioChange = ev => {
        setMarketPerLimit(ev.target.value);
    };

    const displayPriceField = () => {
        if (marketPerLimit === 'limit') {
            return <TextField
                autoFocus
                margin="dense"
                id="price"
                label="Price"
                value={price}
                onInput={e => setPrice(e.target.value)}
                type="number"
                fullWidth
            />
        }
    }

    return (
        <>
            <Dialog open={placeSellOrderDialogOpen} onClose={handleClose} aria-labelledby="form-dialog-title" disableBackdropClick>
                <DialogTitle id="form-dialog-title">Place sell order</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {dialogContentText}
                        <Box mt={1}>
                            <Typography variant="body1" color="textSecondary" component="p">
                                Your available shares for selling: {sharesAvailableForSelling}
                            </Typography>
                        </Box>
                    </DialogContentText>
                    <RadioGroup row aria-label="position" name="position" onChange={handleRadioChange} value={marketPerLimit} >
                        <FormControlLabel
                            value="limit"
                            control={<Radio color="primary" />}
                            label="Limit"
                            labelPlacement="start"
                        />
                        <FormControlLabel
                            value="market"
                            control={<Radio color="primary" />}
                            label="Market"
                            labelPlacement="start"
                        />
                    </RadioGroup>
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
                    {displayPriceField()}

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => { handleSubmit() }} color="primary">
                        Place
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

export default PlaceSellOrder;