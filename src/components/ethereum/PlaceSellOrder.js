import React from 'react';
import { GAS_LIMIT } from '../../config/settings.js'
import { TextField, Button } from '@material-ui/core/'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const PlaceSellOrder = ({ tokenId, accounts, dexContract, placeSellOrderDialogOpen, setPlaceSellOrderDialogOpen }) => {
    const [amount, setAmount] = React.useState('');
    const [price, setPrice] = React.useState('');
    const [marketPerLimit, setMarketPerLimit] = React.useState('limit');


    const handleSubmit = async () => {
        let config = {
            gas: GAS_LIMIT,
            from: accounts[0]
        }
        if (marketPerLimit === 'market') {
            await dexContract.methods.createMarketOrder(tokenId, amount, 1).send(config);
        } else {
            await dexContract.methods.createLimitOrder(tokenId, amount, price, 1).send(config);
        }

        handleClose();
    };

    const handleClose = async () => {
        setAmount('');
        setPrice('');
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
        <Dialog open={placeSellOrderDialogOpen} onClose={handleClose} aria-labelledby="form-dialog-title" disableBackdropClick>
            <DialogTitle id="form-dialog-title">Place sell order</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please, specify the order type, the amount and the price in case of limit orders!
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
    )

}

export default PlaceSellOrder;