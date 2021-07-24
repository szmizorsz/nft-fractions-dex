import React, { useEffect, useState } from 'react'
import { withRouter } from "react-router";
import NFTCard from './NFTCard.js'
import { BufferList } from "bl";
import TokenOwners from './TokenOwners.js';
import Grid from '@material-ui/core/Grid';
import NFTDescription from './NFTDescription.js'
import Box from '@material-ui/core/Box';
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
import TokenTransferApprovalDialog from './TokenTransferApprovalDialog.js';
import NftFractionsRepository from '../../contracts/matic/MaticNftFractionsRepository.json';
import MaticDex from '../../contracts/matic/MaticDex.json';
import MaticBridge from '../../contracts/matic/MaticBridge.json';
import TokenTransferAcrossChainsDialog from './TokenTransferAcrossChainsDialog.js';
import { useApolloClient } from '@apollo/client';
import {
    getTokenDataFromGraph,
    getBalanceFromGraph
} from '../../util/graphDataReader.js';
import MuiAccordion from '@material-ui/core/Accordion';
import withStyles from "@material-ui/core/styles/withStyles";
import Trades from './Trades.js'

const IconLeftAccordionSummary = withStyles({
    expandIcon: {
        order: -1
    }
})(AccordionSummary);

const Accordion = withStyles({
    root: {
        border: 'none',
        boxShadow: 'none',

    },
    expanded: {},
})(MuiAccordion);

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

const MaticNFTDetail = ({ match, web3, accounts, ipfs }) => {
    const { params: { tokenId } } = match;
    const classes = useStyles();
    const apolloClient = useApolloClient();

    const [nftFractionsRepositoryContract, setNftFractionsRepositoryContract] = useState(undefined);
    const [dexContract, setDexContract] = useState(undefined);
    const [maticBridgeContract, setMaticBridgeContract] = useState(undefined);
    const [metaData, setMetadata] = useState(undefined);
    const [owners, setOwners] = useState([]);
    const [totalShares, setTotalShares] = useState(0);
    const [myShares, setMyShares] = useState(0);
    const [originalContract, setOriginalContract] = useState("");
    const [originalTokenId, setOriginalTokenId] = useState("");
    const [buyOrders, setBuyOrders] = useState([]);
    const [sellOrders, setSellOrders] = useState([]);
    const [trades, setTrades] = useState([]);
    const [placeBuyOrderDialogOpen, setPlaceBuyOrderDialogOpen] = useState(false);
    const [placeSellOrderDialogOpen, setPlaceSellOrderDialogOpen] = useState(false);
    const [maticBalance, setEthBalance] = useState(0);
    const [maticReservedBalance, setEthReservedBalance] = useState(0);
    const [sellOrderAvailable, setSellOrderAvailable] = useState(false);
    const [buyOrderAvailable, setBuyOrderAvailable] = useState(false);
    const [sharesAvailableForSelling, setSharesAvailableForSelling] = useState(0);
    const [tokenTransferDialogOpen, setTokenTransferDialogOpen] = useState(false);
    const [selectedNetwork, setSelectedNetwork] = useState(0);
    const [tokenTransferAccrossChainsDialogOpen, setTokenTransferAccrossChainsDialogOpen] = useState(false);

    useEffect(() => {
        const init = async () => {
            const networkId = await web3.eth.net.getId();
            setSelectedNetwork(networkId);
            let deployedNetwork = NftFractionsRepository.networks[networkId];
            const nftFractionsRepositoryContract = new web3.eth.Contract(
                NftFractionsRepository.abi,
                deployedNetwork && deployedNetwork.address,
            );
            deployedNetwork = MaticDex.networks[networkId];
            const dexContract = new web3.eth.Contract(
                MaticDex.abi,
                deployedNetwork && deployedNetwork.address,
            );
            deployedNetwork = MaticBridge.networks[networkId];
            const maticBridgeContract = new web3.eth.Contract(
                MaticBridge.abi,
                deployedNetwork && deployedNetwork.address,
            );
            setNftFractionsRepositoryContract(nftFractionsRepositoryContract);
            setDexContract(dexContract);
            setMaticBridgeContract(maticBridgeContract);

            const [tokenURI, totalSupply, erc721ContractAddress, erc721TokenId, ownersData, acctualAccountsShares, buyOrders, sellOrders, trades] =
                await getTokenDataFromGraph(apolloClient, tokenId, accounts[0].toLowerCase());
            setTotalShares(totalSupply);
            setOriginalContract(erc721ContractAddress);
            setOriginalTokenId(erc721TokenId);
            setOwners(ownersData);
            setMyShares(acctualAccountsShares);
            setBuyOrders(buyOrders);
            setBuyOrderAvailable(buyOrders.length > 0);
            setSellOrders(sellOrders);
            setSellOrderAvailable(sellOrders.length > 0);
            setTrades(trades);
            debugger

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

            const [maticBalance, maticReservedBalance, sharesReservedBalance] =
                await getBalanceFromGraph(apolloClient, accounts[0].toLowerCase(), "0x" + tokenId);
            setEthBalance(maticBalance);
            setEthReservedBalance(maticReservedBalance);
            setSharesAvailableForSelling(acctualAccountsShares - sharesReservedBalance);
        }
        init();
        // eslint-disable-next-line
    }, []);

    const isReady = () => {
        return (
            typeof nftFractionsRepositoryContract !== 'undefined'
            && typeof metaData !== 'undefined'
            && typeof dexContract !== 'undefined'
            && typeof maticBridgeContract !== 'undefined'
            && typeof web3 !== 'undefined'
            && typeof accounts !== 'undefined'
            && selectedNetwork === 80001
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
                        <NFTDescription
                            accounts={accounts}
                            nftFractionsRepositoryContract={nftFractionsRepositoryContract}
                            tokenId={tokenId}
                            name={metaData.name}
                            description={metaData.description}
                            author={metaData.author}
                            ownShares={myShares}
                            totalShares={totalShares}
                            setTokenTransferAccrossChainsDialogOpen={setTokenTransferAccrossChainsDialogOpen} />
                        <div className={classes.root}>
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                >
                                    <Typography className={classes.heading}>Owners (on Matic)</Typography>
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
                            <BuyOrders orders={buyOrders} accounts={accounts} dexContract={dexContract} setBuyOrders={setBuyOrders} />
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
                            <SellOrders orders={sellOrders} accounts={accounts} dexContract={dexContract} setSellOrders={setSellOrders} />
                            <Button
                                onClick={() => { setPlaceSellOrderDialogOpen(true) }}
                                variant="outlined"
                                type="submit">
                                Place Order
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
                <Box mt={5}>
                    <Accordion>
                        <IconLeftAccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <Box ml={3}><Typography>Trade History</Typography></Box>
                        </IconLeftAccordionSummary>
                        <AccordionDetails>
                            <Box ml={3}><Trades trades={trades} /></Box>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Box >
            <PlaceBuyOrder
                web3={web3}
                maticBalance={maticBalance}
                maticReservedBalance={maticReservedBalance}
                tokenId={tokenId}
                accounts={accounts}
                dexContract={dexContract}
                placeBuyOrderDialogOpen={placeBuyOrderDialogOpen}
                setPlaceBuyOrderDialogOpen={setPlaceBuyOrderDialogOpen}
                sellOrderAvailable={sellOrderAvailable}
                setBuyOrders={setBuyOrders} />
            <PlaceSellOrder
                web3={web3}
                tokenId={tokenId}
                accounts={accounts}
                dexContract={dexContract}
                placeSellOrderDialogOpen={placeSellOrderDialogOpen}
                setPlaceSellOrderDialogOpen={setPlaceSellOrderDialogOpen}
                buyOrderAvailable={buyOrderAvailable}
                sharesAvailableForSelling={sharesAvailableForSelling}
                setTokenTransferDialogOpen={setTokenTransferDialogOpen}
                setSellOrders={setSellOrders} />
            <TokenTransferApprovalDialog
                open={tokenTransferDialogOpen}
                nftFractionsRepositoryContract={nftFractionsRepositoryContract}
                accounts={accounts}
                setTokenTransferDialogOpen={setTokenTransferDialogOpen}
                dexContractAddress={dexContract._address} />
            <TokenTransferAcrossChainsDialog
                erc721ContractAddress={originalContract}
                erc721TokenId={originalTokenId}
                erc1155TokenId={tokenId}
                ownSharesAmount={myShares}
                accounts={accounts}
                maticBridgeContract={maticBridgeContract}
                tokenTransferAccrossChainsDialogOpen={tokenTransferAccrossChainsDialogOpen}
                setTokenTransferAccrossChainsDialogOpen={setTokenTransferAccrossChainsDialogOpen} />
        </>
    );
}

export default withRouter(MaticNFTDetail);