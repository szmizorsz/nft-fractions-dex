import React, { useState, useEffect } from 'react';
import { BufferList } from "bl";
import NFTCards from './NFTCards.js'

const AllNFTs = ({ accounts, nftFractionsRepositoryContract, ipfs }) => {
    const [nftList, setNftList] = useState([]);

    useEffect(() => {
        const loadNfts = async () => {
            const nftsFromIpfs = [];
            const tokenIds = await nftFractionsRepositoryContract.methods.getTokenIds().call();
            debugger
            for (let tokenId of tokenIds) {
                const tokenData = await nftFractionsRepositoryContract.methods.getTokenData(tokenId).call();
                const myShares = await nftFractionsRepositoryContract.methods.balanceOf(accounts[0], tokenId).call()
                const tokenURI = tokenData.tokenURI;
                let nftMetadataFromIPFS = { name: 'name' };
                for await (const file of ipfs.get(tokenURI)) {
                    const content = new BufferList()
                    for await (const chunk of file.content) {
                        content.append(chunk)
                    }
                    nftMetadataFromIPFS = JSON.parse(content.toString());
                }
                nftMetadataFromIPFS.tokenId = tokenId;
                nftMetadataFromIPFS.myShares = myShares;
                nftMetadataFromIPFS.sharesAmount = tokenData.totalFractionsAmount;
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