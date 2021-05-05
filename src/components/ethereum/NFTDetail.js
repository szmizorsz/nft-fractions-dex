import React, { useEffect, useState } from 'react'
import { withRouter } from "react-router";
import NFTCard from './NFTCard.js'
import { BufferList } from "bl";
import ERC721 from '../../contracts/ERC721.json';

const NFTDetail = ({ match, web3, accounts, nftFractionsRepositoryContract, dexContract, ipfs }) => {
    const { params: { tokenId } } = match;

    const [metaData, setMetadata] = useState(undefined);

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
            debugger
            setMetadata(nftMetadataFromIPFS);
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
            <NFTCard name={metaData.name} image={metaData.image} description={metaData.description} />
        </>
    );
}

export default withRouter(NFTDetail);