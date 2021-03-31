import React, { useEffect, useState } from 'react';
import getWeb3 from "../../util/getWeb3";
import NftFractionsDex from '../../contracts/NftFractionsDex.json';
import Box from '@material-ui/core/Box'
import DepositNft from './DepositNft.js'
import { Button } from '@material-ui/core/'

const LandingPage = () => {
    const [web3, setWeb3] = useState(undefined);
    const [accounts, setAccounts] = useState(undefined);
    const [nftFractionsDexContract, setNftFractionsDexContract] = useState(undefined);
    const [nftDepositDialogOpen, setNftDepositDialogOpen] = React.useState(false);

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

    if (!isReady()) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Box mt={2}>
                <Button
                    onClick={() => { setNftDepositDialogOpen(true) }}
                    variant="outlined"
                    type="submit">
                    Deposit NFT
                </Button>
            </Box>
            <DepositNft
                web3={web3}
                accounts={accounts}
                nftFractionsDexContract={nftFractionsDexContract}
                nftDepositDialogOpen={nftDepositDialogOpen}
                setNftDepositDialogOpen={setNftDepositDialogOpen} />
        </>
    )

}

export default LandingPage;