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

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
}));
const NFTDetail = ({ match, web3, accounts, nftFractionsRepositoryContract, dexContract, ipfs }) => {
    const { params: { tokenId } } = match;
    const classes = useStyles();

    const [metaData, setMetadata] = useState(undefined);
    const [owners, setOwners] = useState([]);
    const [totalShares, setTotalShares] = useState(0);

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
        <Box mt={15}>
            <Grid container>
                <Grid item md={6}>
                    <NFTCard image={metaData.image} />
                </Grid>
                <Grid item md={1}></Grid>
                <Grid item md={5}>
                    <NFTDescription name={metaData.name} description={metaData.description} />

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
                                <TokenOwners owners={owners} totalShares={totalShares} />
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
                                <Typography>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                                    sit amet blandit leo lobortis eget.
          </Typography>
                            </AccordionDetails>
                        </Accordion>
                    </div>

                </Grid>
            </Grid>
        </Box>
    );
}

export default withRouter(NFTDetail);