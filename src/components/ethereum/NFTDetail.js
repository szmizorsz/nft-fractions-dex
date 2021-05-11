import React, { useEffect, useState } from 'react'
import { withRouter } from "react-router";
import NFTCard from './NFTCard.js'
import { BufferList } from "bl";
import ERC721 from '../../contracts/ERC721.json';
import TokenOwners from './TokenOwners.js';
import Grid from '@material-ui/core/Grid';
import NFTDescription from './NFTDescription.js'
import Box from '@material-ui/core/Box';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import BuyOrders from './BuyOrders.js';
import SellOrders from './SellOrders.js';
import { Button } from '@material-ui/core/';
import PlaceBuyOrder from './PlaceBuyOrder.js';
import PlaceSellOrder from './PlaceSellOrder.js';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
    table: {
        minWidth: 450,
    },
}));

const NFTDetail = ({ match, web3, accounts, nftFractionsRepositoryContract, dexContract, ipfs }) => {
    const { params: { tokenId } } = match;
    const classes = useStyles();

    const [metaData, setMetadata] = useState(undefined);
    const [owners, setOwners] = useState([]);
    const [totalShares, setTotalShares] = useState(0);
    const [originalContract, setOriginalContract] = useState("");
    const [originalTokenId, setOriginalTokenId] = useState("");
    const [buyOrders, setBuyOrders] = useState([]);
    const [sellOrders, setSellOrders] = useState([]);
    const [placeBuyOrderDialogOpen, setPlaceBuyOrderDialogOpen] = useState(false);
    const [placeSellOrderDialogOpen, setPlaceSellOrderDialogOpen] = useState(false);

    useEffect(() => {
        const init = async () => {
            const tokenData = await nftFractionsRepositoryContract.methods.getTokenData(tokenId).call();
            const erc721 = new web3.eth.Contract(ERC721.abi, tokenData.erc721ContractAddress);
            const tokenURI = await erc721.methods.tokenURI(tokenData.erc721TokenId).call();
            let nftMetadataFromIPFS = { name: 'name' };
            for await (const file of ipfs.get(tokenURI)) {
                const content = new BufferList()
                for await (const chunk of file.content) {
                    content.append(chunk)
                }
                nftMetadataFromIPFS = JSON.parse(content.toString());
            }
            nftMetadataFromIPFS.tokenId = tokenId;
            setMetadata(nftMetadataFromIPFS);
            setTotalShares(tokenData.totalFractionsAmount);
            setOriginalContract(tokenData.erc721ContractAddress);
            setOriginalTokenId(tokenData.erc721TokenId);
            const ownersFromChain = await nftFractionsRepositoryContract.methods.getOwnersBYtokenId(tokenId).call();
            let ownersData = [];
            for (let owner of ownersFromChain) {
                const ownerShares = await nftFractionsRepositoryContract.methods.balanceOf(owner, tokenId).call()
                let ownerData = {
                    "owner": owner,
                    "shares": ownerShares
                }
                ownersData.push(ownerData);
            }
            setOwners(ownersData);
            const buyOrdersFromChain = await dexContract.methods.getOrders(tokenId, 0).call();
            setBuyOrders(buyOrdersFromChain);
            const sellOrdersFromChain = await dexContract.methods.getOrders(tokenId, 1).call();
            setSellOrders(sellOrdersFromChain);
        }
        init();
        // eslint-disable-next-line
    }, []);

    const isReady = () => {
        return (
            typeof metaData !== 'undefined'
        );
    }

    if (!isReady()) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Box mt={15}>
                <Grid container>
                    <Grid item md={6}>
                        <NFTCard image={metaData.image} />
                    </Grid>
                    <Grid item md={1}></Grid>
                    <Grid item md={5}>
                        <NFTDescription name={metaData.name} description={metaData.description} author={metaData.author} totalShares={totalShares} />
                        <div className={classes.root}>
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                >
                                    <Typography className={classes.heading}>Owners</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <TokenOwners owners={owners} />
                                </AccordionDetails>
                            </Accordion>
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel2a-content"
                                    id="panel2a-header"
                                >
                                    <Typography className={classes.heading}>Original contract</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <TableContainer className={classes.table} component={Paper}>
                                        <Table aria-label="simple table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Contract</TableCell>
                                                    <TableCell>TokenId</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                <TableRow key={originalContract}>
                                                    <TableCell>{originalContract}</TableCell>
                                                    <TableCell>{originalTokenId}</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </AccordionDetails>
                            </Accordion>
                        </div>
                    </Grid>
                </Grid>
                <Box mt={10}>
                    <Grid container>
                        <Grid item md={5}>
                            <Box mb={3}>
                                <Typography className={classes.heading}>Buy Orders</Typography>
                            </Box>
                            <BuyOrders orders={buyOrders} />
                            <Button
                                onClick={() => { setPlaceBuyOrderDialogOpen(true) }}
                                variant="outlined"
                                type="submit">
                                Place Order
                            </Button>
                        </Grid>
                        <Grid item md={2}></Grid>
                        <Grid item md={5}>
                            <Box mb={3}>
                                <Typography className={classes.heading}>Sell Orders</Typography>
                            </Box>
                            <SellOrders orders={sellOrders} />
                            <Button
                                onClick={() => { setPlaceSellOrderDialogOpen(true) }}
                                variant="outlined"
                                type="submit">
                                Place Order
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box >
            <PlaceBuyOrder
                tokenId={tokenId}
                accounts={accounts}
                dexContract={dexContract}
                placeBuyOrderDialogOpen={placeBuyOrderDialogOpen}
                setPlaceBuyOrderDialogOpen={setPlaceBuyOrderDialogOpen} />
            <PlaceSellOrder
                tokenId={tokenId}
                accounts={accounts}
                dexContract={dexContract}
                placeSellOrderDialogOpen={placeSellOrderDialogOpen}
                setPlaceSellOrderDialogOpen={setPlaceSellOrderDialogOpen} />
        </>
    );
}

export default withRouter(NFTDetail);