import React, { useState, useEffect } from 'react';
import { BufferList } from "bl";
import NFTCards from './NFTCards.js'
import { gql, useApolloClient } from '@apollo/client';

const MyNFTs = ({ accounts, ipfs }) => {
    const [nftList, setNftList] = useState([]);
    const apolloClient = useApolloClient();

    const GET_MY_TOKENS = `
    query getTokens($account: ID)  {
        accounts (
          where: {
            id: $account
          }			
        ) {
          id
          balances {
            id
            value
            token {
              id
              identifier
              totalSupply
              tokenURI
            }
          }
        }
        }  
    `

    useEffect(() => {
        const loadMyNfts = async () => {
            const { data } = await apolloClient.query({
                query: gql(GET_MY_TOKENS),
                variables: {
                    account: accounts[0].toLowerCase()
                }
            })
            const nftsFromIpfs = [];
            if (data.accounts.length > 0 && data.accounts[0].balances.length > 0) {
                for (let balance of data.accounts[0].balances) {
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