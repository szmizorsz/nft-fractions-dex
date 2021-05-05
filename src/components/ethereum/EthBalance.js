import React, { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import DepositEthDialog from './DepositEthDialog.js';
import WithdrawEthDialog from './WithdrawEthDialog.js';
import { Button } from '@material-ui/core/'
import Web3 from 'web3';

const EthBalance = ({ accounts, dexContract }) => {
    const [ethBalance, setEthBalance] = useState(0);
    const [ethDepositDialogOpen, setEthDepositDialogOpen] = useState(false);
    const [ethWithdrawDialogOpen, setEthWithdrawDialogOpen] = useState(false);

    useEffect(() => {
        const loadEthBalance = async () => {
            let ethBalanceFromChain = await dexContract.methods.getEthBalance(accounts[0]).call();
            ethBalanceFromChain = Web3.utils.fromWei(ethBalanceFromChain, 'ether');
            setEthBalance(ethBalanceFromChain);
        }
        loadEthBalance();
        // eslint-disable-next-line
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
                dexContract={dexContract}
                ethDepositDialogOpen={ethDepositDialogOpen}
                setEthDepositDialogOpen={setEthDepositDialogOpen} />
            <WithdrawEthDialog
                ethBalance={ethBalance}
                accounts={accounts}
                dexContract={dexContract}
                ethWithdrawDialogOpen={ethWithdrawDialogOpen}
                setEthWithdrawDialogOpen={setEthWithdrawDialogOpen} />
        </>
    )

}

export default EthBalance;