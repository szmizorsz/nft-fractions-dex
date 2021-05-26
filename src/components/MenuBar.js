import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import logo from "../images/arrows.png";

const useStyles = makeStyles((theme) => ({
    header: {
        flexGrow: 1,
        backgroundColor: "black",
        color: "white",
        boxShadow: "0px 0px 0px 0px"
    },
    logo: {
        maxWidth: 55,
    }
}));

function MenuBar() {
    const classes = useStyles();

    return (
        <AppBar position="fixed" className={classes.header}>
            <Toolbar variant="dense">
                <Grid container>
                    <Grid item md={2}></Grid>
                    <Grid item xs={12} md={3}>
                        <Box mt={0.5}>
                            <a href="/">
                                <img src={logo} alt="Real Estate Management Platform" className={classes.logo} />
                            </a>
                        </Box>
                    </Grid>
                    <Grid item md={2}>
                    </Grid>
                    <Grid item md={3}>
                        <Grid container spacing={24}>
                            <Grid item md={6}>
                                <Box mt={1.5} mr={1}>
                                    <Button color="inherit" fullWidth target={"_blank"} variant='outlined' >
                                        <a href="/matic/landing" style={{ textDecoration: 'none', color: 'white' }}>Open on Matic</a>
                                    </Button>
                                </Box>
                            </Grid>
                            <Grid item md={6}>
                                <Box mt={1.5} ml={1}>
                                    <Button color="inherit" fullWidth target={"_blank"} variant='outlined' >
                                        <a href="/bsc/landing" style={{ textDecoration: 'none', color: 'white' }}>Open on Binance</a>
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item md={2}></Grid>
                </Grid>
            </Toolbar>
        </AppBar>
    );
}

export default MenuBar;
