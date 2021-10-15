import React from 'react'
import { Typography } from "@material-ui/core";
import GitHubIcon from '@material-ui/icons/GitHub';
import EmailIcon from '@material-ui/icons/Email';
import LinkedInIcon from '@material-ui/icons/LinkedIn';
import DescriptionIcon from '@material-ui/icons/Description';
import { makeStyles } from "@material-ui/core/styles";
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles({
    icon: {
        minWidth: '35px',
    },
});

const Footer = () => {
    const classes = useStyles();
    return (
        <Box mt={4}>
            <Typography
                variant="body2"
                color="textSecondary"
                align="center"
            >
                ©
                {new Date().getFullYear()}
                {" developped by Szabolcs Szentes"}
            </Typography>
            <Box mr={3}>
                <Grid container justify="center">
                    <a href="https://medium.com/@szmizorsz/nft-fractions-decentralised-exchange-introduction-3e696f27c065" target="_blank" rel="noopener noreferrer" >
                        <DescriptionIcon color='disabled' className={classes.icon} />
                    </a>
                    <a href="https://github.com/szmizorsz/nft-fractions-dex" target="_blank" rel="noopener noreferrer" >
                        <GitHubIcon color='disabled' className={classes.icon} />
                    </a>
                    <a href="https://www.linkedin.com/in/szabolcs-szentes-21859b68/" target="_blank" rel="noopener noreferrer" >
                        <LinkedInIcon color='disabled' className={classes.icon} />
                    </a>
                    <a href="mailto:szmizorsz@gmail.com" target="_blank" rel="noopener noreferrer" >
                        <EmailIcon color='disabled' className={classes.icon} />
                    </a>
                </Grid>
            </Box>
            <Grid item md={1}>
            </Grid>
        </Box>
    );

}
export default Footer;