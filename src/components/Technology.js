import React from 'react'
import Typography from '@material-ui/core/Typography'
import polygon from "../images/polygon-logo.png";
import binance from "../images/binance-logo.png";
import ipfs from "../images/ipfs-logo.png";
import graph from "../images/graph-logo.png";
import fleek from "../images/fleek-logo.png";
import aws from "../images/aws-logo.png";
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles((theme) => ({

    root: {
        maxWidth: 300,
    },
    media: {
        height: "10vh",
        width: "25vh",
    },
    polygonMedia: {
        height: "6vh",
        width: "28vh",
    },
    binanceMedia: {
        height: "6vh",
        width: "28vh",
    },
    graphMedia: {
        height: "15vh",
        width: "28vh",
    },
    fleekMedia: {
        height: "11vh",
        width: "25vh",
    },
    awsMedia: {
        height: "13vh",
        width: "25vh",
    },
}));

const Technology = () => {
    const classes = useStyles();

    return (
        <Grid container>
            <Grid item xs={12} md={4}>
                <Box ml={6} mt={4}>
                    <Card className={classes.root}>
                        <CardActionArea>
                            <Box ml={2} mt={2} mb={2}>
                                <CardMedia
                                    className={classes.polygonMedia}
                                    image={polygon}
                                    title="Contemplative Reptile"
                                />
                            </Box>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="h2">
                                    Smart Contracts
                                     </Typography>
                                <Typography variant="body2" color="textSecondary" component="p">
                                    Non fungible tokens, ERC721, ERC1155, Openzeppelin, Dex and Bridge contracts
                                    </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Box>
            </Grid>
            <Grid item xs={12} md={4}>
                <Box ml={6} mt={4}>
                    <Card className={classes.root}>
                        <CardActionArea>
                            <Box ml={3} mt={2} mb={2}>
                                <CardMedia
                                    className={classes.binanceMedia}
                                    image={binance}
                                    title="Contemplative Reptile"
                                />
                            </Box>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="h2">
                                    Smart Contracts
                                     </Typography>
                                <Typography variant="body2" color="textSecondary" component="p">
                                    Non fungible tokens, ERC721, ERC1155, Openzeppelin, Dex and Bridge contracts
                                    </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Box>
            </Grid>
            <Grid item xs={12} md={4}>
                <Box ml={6} mt={4}>
                    <Card className={classes.root}>
                        <CardActionArea>
                            <Box ml={3}>
                                <CardMedia
                                    className={classes.media}
                                    image={ipfs}
                                    title="Contemplative Reptile"
                                />
                            </Box>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="h2">
                                    File storage
                                    </Typography>
                                <Typography variant="body2" color="textSecondary" component="p">
                                    Token metadata and photos are stored on IPFS and their hashes on the blockchain.
                                    </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Box>
            </Grid>
            <Grid item xs={12} md={4}>
                <Box ml={6} mt={3}>
                    <Card className={classes.root}>
                        <CardActionArea>
                            <Box ml={3}>
                                <CardMedia
                                    className={classes.graphMedia}
                                    image={graph}
                                    title="Contemplative Reptile"
                                />
                            </Box>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="h2">
                                    Index
                                    </Typography>
                                <Typography variant="body2" color="textSecondary" component="p">
                                    Contract events are indexed by TheGraph.
                                    </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Box>
            </Grid>
            <Grid item xs={12} md={4}>
                <Box ml={6} mt={3}>
                    <Card className={classes.root}>
                        <CardActionArea>
                            <Box ml={3}>
                                <CardMedia
                                    className={classes.fleekMedia}
                                    image={fleek}
                                    title="Contemplative Reptile"
                                />
                            </Box>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="h2">
                                    Hosting
                                    </Typography>
                                <Typography variant="body2" color="textSecondary" component="p">
                                    Truly decentralized application hosted from IPFS. Decentralized naming served by ENS. Deployment powered by Fleek.
                                    </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Box>
            </Grid>
            <Grid item xs={12} md={4}>
                <Box ml={6} mt={3}>
                    <Card className={classes.root}>
                        <CardActionArea>
                            <Box ml={3}>
                                <CardMedia
                                    className={classes.awsMedia}
                                    image={aws}
                                    title="Contemplative Reptile"
                                />
                            </Box>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="h2">
                                    Bridge
                                    </Typography>
                                <Typography variant="body2" color="textSecondary" component="p">
                                    Separate bridge component monitoring both chains is running on AWS.
                                    </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Box>
            </Grid>
        </Grid>
    );

}
export default Technology;