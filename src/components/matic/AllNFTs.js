import React, { useState, useEffect } from 'react';
import { BufferList } from "bl";
import NFTCards from './NFTCards.js'
import { gql, useApolloClient } from '@apollo/client';

const AllNFTs = ({ accounts, nftFractionsRepositoryContract, ipfs, apolloClient }) => {
    const [nftList, setNftList] = useState([]);

    const GET_TOKENS = `
    query getTokens {
        tokens {
            id
            identifier
            totalSupply
            tokenURI
          }
    }
    `
    useEffect(() => {
        const loadNfts = async () => {

            apolloClient.query({
                query: gql(GET_TOKENS)
            })
                .then(async (data) => {
                    debugger
                    const nftsFromIpfs = [];
                    for (let token of data.data.tokens) {
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
                        //nftMetadataFromIPFS.myShares = myShares;
                        nftMetadataFromIPFS.sharesAmount = token.totalSupply;
                        nftsFromIpfs.push(nftMetadataFromIPFS);
                    }
                    setNftList(nftsFromIpfs);
                })
                .catch(err => { console.log("Error fetching data from the graph: ", err) });
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