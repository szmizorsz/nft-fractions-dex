import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles((theme) => ({
    table: {
        minWidth: 650,
    },
}));

function Trades({ trades }) {
    const classes = useStyles();

    const tableDisplay = (mortgages) => {
        let table;
        if (trades.length > 0) {
            table =
                <TableContainer className={classes.table} component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Trader1</TableCell>
                                <TableCell>Trader2</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {trades.map((row) => (
                                <TableRow key={row.date}>
                                    <TableCell>{row.date}</TableCell>
                                    <TableCell>{row.amount}</TableCell>
                                    <TableCell>{row.price}</TableCell>
                                    <TableCell>{row.trader1}</TableCell>
                                    <TableCell>{row.trader2}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>;
        } else {
            table =
                <Box ml={5}>
                    <Typography variant="body2" color="textSecondary" component="p">
                        There has been no trade for this NFT yet
                </Typography>
                </Box>;
        }
        return table;
    }

    return (
        <Box mt={2}>
            {tableDisplay(trades)}
        </Box>
    );
}

export default Trades;
