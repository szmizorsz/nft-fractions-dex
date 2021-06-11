import React, { useState, useEffect } from 'react';
import { BufferList } from "bl";
import NFTCards from './NFTCards.js'

const MyNFTs = ({ accounts, nftFractionsRepositoryContract, ipfs }) => {
    const [nftList, setNftList] = useState([]);

    useEffect(() => {
        const loadMyNfts = async () => {
            const nftsFromIpfs = [];
            const tokenIds = await nftFractionsRepositoryContract.methods.getTokenIdsByShareOwner(accounts[0]).call();
            for (let tokenId of tokenIds) {
                const tokenData = await nftFractionsRepositoryContract.methods.getTokenData(tokenId).call();
                const myShares = await nftFractionsRepositoryContract.methods.balanceOf(accounts[0], tokenId).call()
                const tokenURI = tokenData.tokenURI;
                let nftMetadataFromIPFS;
                for await (const file of ipfs.get(tokenURI)) {
                    const content = new BufferList()
                    for await (const chunk of file.content) {
                        content.append(chunk)
                    }
                    nftMetadataFromIPFS = JSON.parse(content.toString());
                }
                nftMetadataFromIPFS.tokenId = tokenId;
                nftMetadataFromIPFS.sharesAmount = tokenData.totalFractionsAmount;
                nftMetadataFromIPFS.myShares = myShares;
                nftsFromIpfs.push(nftMetadataFromIPFS);
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