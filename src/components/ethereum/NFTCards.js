import React from 'react'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Box from '@material-ui/core/Box';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import { GAS_LIMIT } from '../../config/settings.js'

const useStyles = makeStyles((theme) => ({

    root: {
        maxWidth: 300,
    },
    media: {
        height: "25vh",
        width: "25vh",
    },
}));

const NFTCards = ({ nftList, nftFractionsDexContract, accounts }) => {
    const classes = useStyles();

    const handleWithdrawSubmit = async (tokenId) => {
        let config = {
            gas: GAS_LIMIT,
            from: accounts[0]
        }
        await nftFractionsDexContract.methods.withdrawNft(tokenId).send(config);
    };

    const withdrawButtonDisplay = (myShares, totalShares, tokenId, row) => {
        if (myShares === totalShares) {
            return <Box ml={30} >
                <Button size="small" color="primary" onClick={() => { handleWithdrawSubmit(tokenId) }}>
                    Withdraw
                </Button>
            </Box>;
        }
    }

    return (
        <Grid container>
            {nftList.map((row) => (
                <Grid item xs={12} md={4} key={row.name}>
                    <Box ml={5} mb={3} >
                        <Card className={classes.root} >
                            <CardActionArea>
                                <Box ml={1}>
                                    <CardMedia
                                        className={classes.media}
                                        image={row.image}
                                        title="Contemplative Reptile"
                                    />
                                </Box>
                                <CardContent>
                                    <Typography gutterBottom variant="h5" component="h2">
                                        {row.name}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" component="p">
                                        {row.description}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                            <CardActions>
                                <Box mr={2}>
                                    <Typography variant="body2" color="textSecondary" component="p">
                                        Own/Total shares: {row.myShares}/{row.sharesAmount}
                                    </Typography>
                                </Box>
                                {withdrawButtonDisplay(row.myShares, row.sharesAmount, row.tokenId, row)}
                            </CardActions>
                        </Card>
                    </Box>
                </Grid>
            ))}
        </Grid>
    );

}
export default NFTCards;