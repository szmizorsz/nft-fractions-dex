import { gql } from '@apollo/client';
import Web3 from "web3";

const GET_ALL_TOKENS = `
query getTokens($account: String) {
    tokens(
        where: {
          deposited: true
        }			
    ) {
      id
      identifier
      totalSupply
      tokenURI
      balances (
        where: {
            account: $account
          }
      ) {      
        value
      }
    }
  }
`
export async function getAllTokensFromGraph(apolloClient, account) {
  const { data } = await apolloClient.query({
    query: gql(GET_ALL_TOKENS),
    variables: {
      account: account
    }
  })
  return data.tokens;
}

const GET_ACCOUNT = `
query getTokens($account: ID)  {
    accounts (
      where: {
        id: $account
      }			
    ) {
      id
      balances (
      where: {
        value_gt: 0
          }			
         ) {
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
export async function getAccountFromGraph(apolloClient, account) {
  const { data } = await apolloClient.query({
    query: gql(GET_ACCOUNT),
    variables: {
      account: account
    }
  })
  let accountFromGraph = null;
  if (data.accounts.length > 0) {
    accountFromGraph = data.accounts[0];
  }
  return accountFromGraph;
}

const GET_BALANCE = `
query getBalance($account: ID, $tokenId: String) {
    accounts(
      where: {
        id: $account
      }
    ) {
      ethBalance
      ethReservedBalance
      shareReservedBalances (
        where: {
          token: $tokenId
        }
      ) {
      	value
    	}
      }
  }
  `
export async function getBalanceFromGraph(apolloClient, account, tokenId) {
  const { data } = await apolloClient.query({
    query: gql(GET_BALANCE),
    variables: {
      account: account,
      tokenId: tokenId
    }
  })
  let maticBalance = 0;
  if (data.accounts.length > 0) {
    if (data.accounts[0].ethBalance != null) {
      maticBalance = Web3.utils.fromWei(data.accounts[0].ethBalance, 'ether');
    }
  }
  let maticReservedBalance = 0;
  if (data.accounts.length > 0) {
    if (data.accounts[0].ethReservedBalance != null) {
      maticReservedBalance = Web3.utils.fromWei(data.accounts[0].ethReservedBalance, 'ether');
    }
  }
  let sharesReservedBalance = 0;
  if (data.accounts.length > 0 && data.accounts[0].shareReservedBalances.length > 0) {
    sharesReservedBalance = data.accounts[0].shareReservedBalances[0].value;
  }
  return [maticBalance, maticReservedBalance, sharesReservedBalance];
}

const GET_TOKEN = `
query getToken($identifier: BigInt){
    tokens (
      where: {
        identifier: $identifier
      }
    ) {
      id
      identifier
      totalSupply
      tokenURI
      erc721ContractAddress
      erc721TokenId
      balances {
        id
        value
        account {
            id
        }
      }
    	orders (
            where: {
              removed: false
            }
        ){
        id
        account {
          id
        }
        price
        amount
        filled
        side        
      }  
      trades {
        trader1 {
          id
        }
        trader2 {
          id
        }
        price
        amount
        date
    }       	
    }
  }
`
export async function getTokenDataFromGraph(apolloClient, tokenId, account) {
  const { data } = await apolloClient.query({
    query: gql(GET_TOKEN),
    variables: {
      identifier: tokenId
    }
  })
  const tokenURI = data.tokens[0].tokenURI;
  const totalSupply = data.tokens[0].totalSupply;
  const erc721ContractAddress = data.tokens[0].erc721ContractAddress;
  const erc721TokenId = data.tokens[0].erc721TokenId;
  let ownersData = [];
  if (data.tokens[0].balances.length > 0) {
    for (let balance of data.tokens[0].balances) {
      let owner = balance.account.id;
      let ownerShares = balance.value;
      let ownerData = {
        "owner": owner,
        "shares": ownerShares
      }
      ownersData.push(ownerData);
    }
  }
  let acctualAccountsShares = ownersData
    .filter((ownerData) => {
      return ownerData.owner === account
    })
    .map((ownerData) => {
      return ownerData.shares
    });
  const ordersMapped = data.tokens[0].orders
    .map((order) => ({
      ...order,
      trader: order.account.id,
      id: order.id.substr(2),
      ethPrice: Web3.utils.fromWei(order.price, 'ether'),
      tokenId: tokenId
    }));
  const buyOrders = ordersMapped.filter((order) => { return order.side === "Buy"; });
  const sellOrders = ordersMapped.filter((order) => { return order.side === "Sell"; });
  const trades = data.tokens[0].trades
    .map((trade) => ({
      ...trade,
      trader1: trade.trader1.id,
      trader2: trade.trader2.id,
      price: Web3.utils.fromWei(trade.price, 'ether'),
      date: new Date(trade.date * 1000).toString(),
    }));
  return [tokenURI, totalSupply, erc721ContractAddress, erc721TokenId, ownersData, acctualAccountsShares, buyOrders, sellOrders, trades];
}

const GET_ORDERS = `
query getOrder($tokenId: String) {
    orders (
      where: {
        token: $tokenId
        removed: false
      }
    ) {
        id
        token {
        id
        identifier
      }
      account {
        id
      }
      price
      amount
      filled
      side
    }
  }
`
export async function getOrdersFromGraph(apolloClient, tokenId) {
  const { data } = await apolloClient.query({
    query: gql(GET_ORDERS),
    variables: {
      tokenId: tokenId
    }
  })
  const ordersMapped = data.orders
    .map((order) => ({
      ...order,
      trader: order.account.id,
      id: order.id.substr(2),
      ethPrice: Web3.utils.fromWei(order.price, 'ether'),
      tokenId: tokenId
    }));
  const buyOrdersFromGraph = ordersMapped.filter((order) => { return order.side === "Buy"; });
  const sellOrdersFromGraph = ordersMapped.filter((order) => { return order.side === "Sell"; });
  return [buyOrdersFromGraph, sellOrdersFromGraph];
}