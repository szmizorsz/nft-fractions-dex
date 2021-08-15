import React from 'react'
import Typography from '@material-ui/core/Typography'
import fractions from "../images/fractions-icon.png";
import mint from "../images/mint-icon.png";
import money from "../images/money-icon.jpg";
import sale from "../images/sale-icon.jpg";
import crosschain from "../images/cross-chain-icon.png";
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { RowingOutlined } from '@material-ui/icons';

const privateKeys = ['8ea97d5067dc234a17ae440add78814bb684da7533865560d9b3dd911f0a1d35',
    '4770c7c06f4ab3e7211b277af961113c72204e73ea229834a1096c16d7088e28'];

const useStyles = makeStyles((theme) => ({
    icon: {
        maxWidth: 50,
        maxHeight: 50
    },
    accountsButton: {
        textTransform: 'none',
    },
}));

const Overview = () => {
    const classes = useStyles();

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Grid container>
                <Grid item md={2}></Grid>
                <Grid item xs={12} md={8}>
                    <List>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <img src={fractions} alt="NFT Fractions" className={classes.icon} />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary="NFT Fractions Decentralized Exchange" />
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <img src={mint} alt="Mint shares" className={classes.icon} />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary="Mint ERC1155 shares of deposited NFTs" />
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <img src={sale} alt="Trade shares" className={classes.icon} />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary="Trade shares" />
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <img src={money} alt="Acquire ownership" className={classes.icon} />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary="Acquire ownership of all shares of a NFT and withdraw it" />
                        </ListItem>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    <img src={crosschain} alt="Cross chain" className={classes.icon} />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary="Trade cross chain: transfer shares over chains" />
                        </ListItem>
                    </List>
                </Grid>
                <Grid item md={2}>

                    <Box mt={29} mr={5}>
                        <Typography variant="body2" color="textSecondary" component="p" align="right">
                            You can try it:
                </Typography>
                    </Box>
                    <Box mr={3}>
                        <Grid container justify="flex-end">
                            <Button className={classes.accountsButton} variant="primary" color="primary" align="right" onClick={handleClickOpen}>
                                Accounts
                    </Button>
                        </Grid>
                    </Box>
                </Grid>
            </Grid>

            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth="false"
            >
                <div style={{ width: 800 }}>
                    <DialogTitle id="alert-dialog-title">Accounts to play with</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            The following accounts have been preloaded on both chains with Matic and BNB. They already own some shares of deposited NFTs if you would like to try out those functionalities. Just import the private keys into Metamask:
                    </DialogContentText>
                        <TableContainer component={Paper}>
                            <Table className={classes.table} size="small" aria-label="a dense table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Private key</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {privateKeys.map((row) => (
                                        <TableRow key={RowingOutlined}>
                                            <TableCell>{row}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </DialogContent>
                </div>
            </Dialog>
        </>
    );

}
export default Overview;