import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import Grid from '@material-ui/core/Grid';
import { TextField } from '@material-ui/core/';

const useStyles = makeStyles((theme) => ({
    table: {
        minWidth: 450,
    },
    root: {
        '& > *': {
            borderBottom: 'unset',
        },
    },
}));

function SellOrders({ orders }) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);

    const rowsDisplay = () => {
        if (orders.length === 0) {
            return <Box mt={1} mb={1} ml={2}>
                <Typography variant='subtitle2'>No orders</Typography>
            </Box>
        } else {
            return <TableBody>
                {orders.map((row) => (
                    <>
                        <TableRow key={row.id}>
                            <TableCell>
                                <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                                    {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                </IconButton>
                            </TableCell>
                            <TableCell>{row.price}</TableCell>
                            <TableCell>{row.amount}</TableCell>
                            <TableCell>{row.filled}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                <Collapse in={open} timeout="auto" unmountOnExit>
                                    <Box margin={1}>
                                        <Grid container className={classes.root}>
                                            <Grid md={2}></Grid>
                                            <Grid item xs={12} md={10}>
                                                <TextField InputProps={{ disableUnderline: true }} label="Trader" value={row.trader} margin="dense" />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Collapse>
                            </TableCell>
                        </TableRow>
                    </>
                ))}
            </TableBody>
        }
    }

    return (
        <TableContainer className={classes.table} component={Paper}>
            <Table aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell />
                        <TableCell>Price (ETH)</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Filled</TableCell>
                    </TableRow>
                </TableHead>
                {rowsDisplay()}
            </Table>
        </TableContainer>
    );
}

export default SellOrders;