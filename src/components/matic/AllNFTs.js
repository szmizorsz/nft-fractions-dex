import React, { useState, useEffect } from 'react';
import { BufferList } from "bl";
import NFTCards from './NFTCards.js'
import { gql } from '@apollo/client';

const AllNFTs = ({ accounts, ipfs, apolloClient }) => {
    const [nftList, setNftList] = useState([]);

    const GET_TOKENS = `
    query getTokens($account: String) {
        tokens {
          id
          identifier
          totalSupply
          tokenURI
          balances (
              account: $account
          ) {      
            value
          }
        }
      }
    `
    useEffect(() => {
        const loadNfts = async () => {
            const { data } = await apolloClient.query({
                query: gql(GET_TOKENS),
                variables: {
                    account: accounts[0]
                }
            })
            const nftsFromIpfs = [];
            for (let token of data.tokens) {
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
                nftMetadataFromIPFS.myShares = token.balances[0].value;
                nftMetadataFromIPFS.sharesAmount = token.totalSupply;
                nftsFromIpfs.push(nftMetadataFromIPFS);
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