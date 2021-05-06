import React, { useState, useEffect } from 'react';
import { BufferList } from "bl";
import ERC721 from '../../contracts/ERC721.json';
import NFTCards from './NFTCards.js'

const AllNFTs = ({ web3, accounts, nftFractionsRepositoryContract, ipfs }) => {
    const [nftList, setNftList] = useState([]);

    useEffect(() => {
        const loadNfts = async () => {
            const nftsFromIpfs = [];
            const tokenIds = await nftFractionsRepositoryContract.methods.getTokenIds().call();
            for (let tokenId of tokenIds) {
                const tokenData = await nftFractionsRepositoryContract.methods.getTokenData(tokenId).call();
                const myShares = await nftFractionsRepositoryContract.methods.balanceOf(accounts[0], tokenId).call()
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
            <NFTCards nftList={nftList} nftFractionsRepositoryContract={nftFractionsRepositoryContract} accounts={accounts} />
        </>
    )

}

export default AllNFTs;