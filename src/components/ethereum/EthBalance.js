import React, { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import DepositEthDialog from './DepositEthDialog.js';
import WithdrawEthDialog from './WithdrawEthDialog.js';
import { Button } from '@material-ui/core/'
import Web3 from 'web3';

const EthBalance = ({ accounts, nftFractionsDexContract }) => {
    const [ethBalance, setEthBalance] = useState(0);
    const [ethDepositDialogOpen, setEthDepositDialogOpen] = useState(false);
    const [ethWithdrawDialogOpen, setEthWithdrawDialogOpen] = useState(false);

    useEffect(() => {
        const loadEthBalance = async () => {
            let ethBalanceFromChain = await nftFractionsDexContract.methods.getEthBalance(accounts[0]).call();
            ethBalanceFromChain = Web3.utils.fromWei(ethBalanceFromChain, 'ether');
            setEthBalance(ethBalanceFromChain);
        }
        loadEthBalance();
    }, []);

    return (
        <>
            <Box mt={5} mb={5}>
                <Typography>
                    Your ETH Balance: {ethBalance}
                </Typography>
            </Box>
            <Button
                onClick={() => { setEthDepositDialogOpen(true) }}
                variant="outlined"
                type="submit">
                Deposit
            </Button>
            <Button
                onClick={() => { setEthWithdrawDialogOpen(true) }}
                variant="outlined"
                type="submit">
                Withdraw
            </Button>
            <DepositEthDialog
                accounts={accounts}
                nftFractionsDexContract={nftFractionsDexContract}
                ethDepositDialogOpen={ethDepositDialogOpen}
                setEthDepositDialogOpen={setEthDepositDialogOpen} />
            <WithdrawEthDialog
                ethBalance={ethBalance}
                accounts={accounts}
                nftFractionsDexContract={nftFractionsDexContract}
                ethWithdrawDialogOpen={ethWithdrawDialogOpen}
                setEthWithdrawDialogOpen={setEthWithdrawDialogOpen} />
        </>
    )

}

export default EthBalance;