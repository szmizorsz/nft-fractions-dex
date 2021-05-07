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
import { Link } from "react-router-dom";
import {
    Switch,
    Route
} from "react-router-dom";
import NFTDetail from "./NFTDetail.js";

const useStyles = makeStyles((theme) => ({

    root: {
        maxWidth: 400
    },
    card: {
        width: "200px",
        height: "222px"
    },
    media: {
        height: "25vh",
        width: "41vh",
    },
}));

const NFTCards = ({ nftList, nftFractionsRepositoryContract, accounts }) => {
    const classes = useStyles();

    const handleWithdrawSubmit = async (tokenId) => {
        let config = {
            gas: GAS_LIMIT,
            from: accounts[0]
        }
        await nftFractionsRepositoryContract.methods.withdrawNft(tokenId).send(config);
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
                <Grid item xs={12} md={6} key={row.name}>
                    <Box ml={5} mb={6} >
                        <Card className={classes.root} >
                            <Link to={`/ethereum/nft/${row.tokenId}`} style={{ textDecoration: 'none' }}>
                                <CardActionArea>
                                    <CardMedia
                                        className={classes.media}
                                        image={row.image}
                                        title="Contemplative Reptile"
                                    />
                                    <CardContent>
                                        <Typography gutterBottom variant="h6" component="p" color="textPrimary" >
                                            {row.name}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Link>
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
            <Switch>
                <Route path="/ethereum/nft/:tokenId" exact>
                    <NFTDetail />
                </Route>

            </Switch>
        </Grid>
    );

}
export default NFTCards;