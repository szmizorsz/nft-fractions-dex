import React, { useState, useEffect } from 'react';
import { BufferList } from "bl";
import NFTCards from './NFTCards.js'
import { useApolloClient } from '@apollo/client';
import {
    getAllTokensFromGraph
} from '../../util/graphDataReader.js';

const AllNFTs = ({ accounts, ipfs }) => {
    const [nftList, setNftList] = useState([]);
    const apolloClient = useApolloClient();

    useEffect(() => {
        const loadNfts = async () => {
            const tokens = await getAllTokensFromGraph(apolloClient, accounts[0].toLowerCase());
            const nftsFromIpfs = [];
            if (tokens.length > 0) {
                for (let token of tokens) {
                    const tokenURI = token.tokenURI;
                    let nftMetadataFromIPFS = { name: 'name' };
                    for await (const file of ipfs.get(tokenURI)) {
                        const content = new BufferList()
                        for await (const chunk of file.content) {
                            content.append(chunk)
                        }
                        nftMetadataFromIPFS = JSON.parse(content.toString());
                    }
                    nftMetadataFromIPFS.tokenId = token.identifier;
                    nftMetadataFromIPFS.myShares = token.balances.length === 1 ? token.balances[0].value : 0;
                    nftMetadataFromIPFS.sharesAmount = token.totalSupply;
                    nftsFromIpfs.push(nftMetadataFromIPFS);
                }
            }
            setNftList(nftsFromIpfs);
        }
        loadNfts();
        // eslint-disable-next-line
    }, []);

    return (
        <>
            <NFTCards nftList={nftList} />
        </>
    )

}

export default AllNFTs;