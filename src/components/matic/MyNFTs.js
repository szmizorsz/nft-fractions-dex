import React, { useState, useEffect } from 'react';
import { BufferList } from "bl";
import NFTCards from './NFTCards.js'
import { useApolloClient } from '@apollo/client';
import {
    getAccountFromGraph
} from '../../util/graphDataReader.js';

const MyNFTs = ({ accounts, ipfs }) => {
    const [nftList, setNftList] = useState([]);
    const apolloClient = useApolloClient();

    useEffect(() => {
        const loadMyNfts = async () => {
            const account = await getAccountFromGraph(apolloClient, accounts[0].toLowerCase());
            const nftsFromIpfs = [];
            if (account != null && account.balances.length > 0) {
                for (let balance of account.balances) {
                    let token = balance.token;
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
                    nftMetadataFromIPFS.myShares = balance.value;
                    nftMetadataFromIPFS.sharesAmount = token.totalSupply;
                    nftsFromIpfs.push(nftMetadataFromIPFS);
                }
            }
            setNftList(nftsFromIpfs);
        }
        loadMyNfts();
        // eslint-disable-next-line
    }, []);

    return (
        <>
            <NFTCards nftList={nftList} />
        </>
    )

}

export default MyNFTs;