import React, { useEffect, useState } from 'react';
import getWeb3 from "../../util/getWeb3";
import NftFractionsDex from '../../contracts/NftFractionsDex.json';
import ERC721Mock from '../../contracts/ERC721Mock.json';
import { GAS_LIMIT } from '../../config/settings.js'
import { TextField, Button } from '@material-ui/core/'
import { makeStyles } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            margin: theme.spacing(1),
        },
        '& .MuiButton-root': {
            margin: theme.spacing(1),
        },
        '& .MuiTypography-root': {
            margin: theme.spacing(1),
        },
    },
}));

const DepositNft = () => {
    const classes = useStyles();
    const [web3, setWeb3] = useState(undefined);
    const [accounts, setAccounts] = useState(undefined);
    const [nftFractionsDexContract, setNftFractionsDexContract] = useState(undefined);

    const [originalContract, setOriginalContract] = React.useState('');
    const [originalTokenId, setOriginalTokenId] = React.useState('');
    const [fractionsAmount, setFractionsAmount] = React.useState('');

    useEffect(() => {
        const init = async () => {
            const web3 = await getWeb3();
            const accounts = await web3.eth.getAccounts();
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = NftFractionsDex.networks[networkId];
            const nftFractionsDexContract = new web3.eth.Contract(
                NftFractionsDex.abi,
                deployedNetwork && deployedNetwork.address,
            );

            console.log(networkId);
            setWeb3(web3);
            setAccounts(accounts);
            setNftFractionsDexContract(nftFractionsDexContract);
        }
        init();
        window.ethereum.on('accountsChanged', accounts => {
            setAccounts(accounts);
        });
    }, []);

    const isReady = () => {
        return (
            typeof nftFractionsDexContract !== 'undefined'
            && typeof web3 !== 'undefined'
            && typeof accounts !== 'undefined'
        );
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const accounts = await web3.eth.getAccounts();

        let config = {
            gas: GAS_LIMIT,
            from: accounts[0]
        }
        const erc721contract = new web3.eth.Contract(ERC721Mock.abi, originalContract);
        await erc721contract.methods.approve(nftFractionsDexContract._address, originalTokenId).send(config);
        await nftFractionsDexContract.methods.depositNft(originalContract, originalTokenId, fractionsAmount).send(config)
            .once('receipt', (receipt) => {
                console.log(receipt);
            });

        setOriginalContract('');
        setOriginalTokenId();
        setFractionsAmount();
    }

    if (!isReady()) {
        return <div>Loading...</div>;
    }

    return (
        <Box mt={2}>
            <form className={classes.root} noValidate autoComplete="off" onSubmit={handleSubmit}>
                <TextField
                    variant="outlined"
                    fullWidth
                    required
                    id="originalContract"
                    value={originalContract}
                    onInput={e => setOriginalContract(e.target.value)}
                    label="Contract address"
                    margin="dense" />
                <TextField
                    variant="outlined"
                    fullWidth
                    id="originalTokenId"
                    value={originalTokenId || ''}
                    onInput={e => setOriginalTokenId(e.target.value)}
                    label="Token ID"
                    type="number"
                    margin="dense" />
                <TextField
                    variant="outlined"
                    fullWidth
                    id="fractionsAmount"
                    value={fractionsAmount || ''}
                    onInput={e => setFractionsAmount(e.target.value)}
                    label="Shares amount"
                    type="number"
                    margin="dense" />
                <Button
                    fullWidth
                    variant="outlined"
                    type="submit">
                    Deposit
                </Button>
            </form>
        </Box>
    )

}

export default DepositNft;