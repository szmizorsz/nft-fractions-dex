import React, { useEffect, useState } from 'react'
import { withRouter } from "react-router";
import NFTCard from './NFTCard.js'
import { BufferList } from "bl";
import ERC721 from '../../contracts/ERC721.json';
import TokenOwners from './TokenOwners.js';
import Grid from '@material-ui/core/Grid';

const NFTDetail = ({ match, web3, accounts, nftFractionsRepositoryContract, dexContract, ipfs }) => {
    const { params: { tokenId } } = match;

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
        <>
            <Grid container>
                <Grid item md={3}>
                    <NFTCard name={metaData.name} image={metaData.image} description={metaData.description} />
                </Grid>
                <Grid item md={1}></Grid>
                <Grid item md={6}>
                    <TokenOwners owners={owners} totalShares={totalShares} />
                </Grid>
            </Grid>
        </>
    );
}

export default withRouter(NFTDetail);