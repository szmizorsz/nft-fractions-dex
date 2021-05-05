import React, { useState, useEffect } from "react";
import getWeb3 from "../../util/getWeb3";
import NftFractionsRepository from '../../contracts/NftFractionsRepository.json';
import Dex from '../../contracts/Dex.json';
import ipfsClient from "ipfs-http-client";
import { IPFS } from '../../config/settings'
import LandingPage from './LandingPage.js';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import NFTDetail from "./NFTDetail.js";

function LoadingContainer() {
  debugger
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);
  const [nftFractionsRepositoryContract, setNftFractionsRepositoryContract] = useState(undefined);
  const [dexContract, setDexContract] = useState(undefined);
  const [ipfs] = useState(ipfsClient({ host: IPFS.HOST, port: IPFS.PORT, protocol: IPFS.PROTOCOL }));

  useEffect(() => {
    const init = async () => {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      let deployedNetwork = NftFractionsRepository.networks[networkId];
      const nftFractionsRepositoryContract = new web3.eth.Contract(
        NftFractionsRepository.abi,
        deployedNetwork && deployedNetwork.address,
      );
      deployedNetwork = Dex.networks[networkId];
      const dexContract = new web3.eth.Contract(
        Dex.abi,
        deployedNetwork && deployedNetwork.address,
      );
      setWeb3(web3);
      setAccounts(accounts);
      setNftFractionsRepositoryContract(nftFractionsRepositoryContract);
      setDexContract(dexContract);
    }
    init();
    window.ethereum.on('accountsChanged', accounts => {
      setAccounts(accounts);
    });
    // eslint-disable-next-line
  }, []);

  const isReady = () => {
    return (
      typeof nftFractionsRepositoryContract !== 'undefined'
      && typeof dexContract !== 'undefined'
      && typeof web3 !== 'undefined'
      && typeof accounts !== 'undefined'
    );
  }

  if (!isReady()) {
    debugger
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Switch>
        <Route path="/ethereum/landing" render={(props) => <LandingPage {...props} web3={web3} accounts={accounts} nftFractionsRepositoryContract={nftFractionsRepositoryContract} dexContract={dexContract} ipfs={ipfs} />} />
        <Route path="/ethereum/nft/:tokenId" render={(props) => <NFTDetail {...props} web3={web3} accounts={accounts} nftFractionsRepositoryContract={nftFractionsRepositoryContract} dexContract={dexContract} ipfs={ipfs} />} />
      </Switch>
    </Router>
  );
}

export default LoadingContainer;
