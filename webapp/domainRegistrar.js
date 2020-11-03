import { useState, useRef, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";

// NOTE: be aware of this: https://flaviocopes.com/parcel-regeneratorruntime-not-defined/
import Web3 from "web3";

// Import compiled contract artifacts for function interaction
import RegistrarArtifact from "../build/contracts/Registrar.json";
import BidderArtifact from"../build/contracts/Bidder.json"
import { isAddress } from "web3-utils";

// Contract setup - to update after deployment
export const RegistrarAddress = "0x09f7Ed3E475972cd1d60C165439EfE1Cb6737532";
export const BidderAddress = "0x0912d95628A24Ebdb410934aa886f56280bCB7C4";

// Web3 provider endpoints
const infuraWSS = `wss://ropsten.infura.io/ws/v3/dfe7b73d377740b69fefd0ed7a8b104d`;
const localGanache = "ws://127.0.0.1:7545" // Local Ganache RPC address

export const Testnet = "localhost";

// Set up web3 provider
let web3;

if (window.ethereum) {
  web3 = new Web3(window.ethereum);
  window.ethereum.enable();
} else {
  console.warn(`No web3 detected, falling back on external provider.`);
  web3 = new Web3(new Web3.providers.WebsocketProvider(localGanache));
}

// Set up contract objects
const regContract = new web3.eth.Contract(RegistrarArtifact.abi, RegistrarAddress);
const bidContract = new web3.eth.Contract(BidderArtifact.abi, BidderAddress);

// Set up event listeners
// Registrar Listeners
regContract.events.AddDomain()
.on('data', function(event){
  var {domainName, target, domainExpiry} = event.returnValues;
  console.log(`Domain ${domainName} added. Owner: ${target}, Expiry: ${domainExpiry}.`);
})
.on('error', console.error);

regContract.events.RemoveDomain()
.on('data', function(event){
  var {domainName, target, domainExpiry} = event.returnValues;
  console.log(`Domain ${domainName} deleted. Owner: ${target}, Expiry: ${domainExpiry}.`);
})
.on('error', console.error);

// Bidder Listeners
bidContract.events.StartBid()
.on('data', function(event){
  var {domainName, sender} = event.returnValues;
  console.log(`Bid for domain ${domainName} started by ${sender}.`);
})
.on('error', console.error);

bidContract.events.ClaimDomain()
.on('data', function(event){
  var {domainName, sender} = event.returnValues;
  console.log(`Domain ${domainName} claimed by ${sender}.`);
})
.on('error', console.error);

export const getRegisteredDomains = async() => {
  let addedDomains = await regContract.getPastEvents("AddDomain", { fromBlock: 1});
  return addedDomains;
}

// Query domain registration information
export const querySpecificDomain = async (domainName) => {
  const {domainOwner, domainExpiry} = await regContract.methods.getSpecificDomainDetails(domainName).call();
  return { owner: domainOwner, expiry: domainExpiry };
};

// Reverse query
export const queryAddress = async (address) => {
  if (!(await isAddress(address))){
    alert("Address is invalid! Please check that the address input is valid.");
    return
  }
  let queryRes = await regContract.getPastEvents("AddDomain", {
    filter: {owner: address},
    fromBlock: 1
  });
  return queryRes;
}

// Query bidding information
export const queryBid = async (domainName) => {
  const {commitExp, revealExp, claimExp, highBid, highBidder, active} = await bidContract.methods.getBiddingInfo(domainName).call();
  return { commit: commitExp, reveal: revealExp, claim: claimExp, bid: highBid, bidder: highBidder, status: active };
};

// Start bid, called only after validity check passes
export const startBid = async(domainName, commit) => {
  if (!(await bidContract.methods.canStart(domainName).call())) {
    alert("Cannot start bid. Please check that the domain input is valid.");
    return
  }
  await bidContract.methods.startBid(domainName, commit).send({from: ethereum.selectedAddress});
  return
}

// Add bid, called only after validity check passes
export const addBid = async(domainName, commit) => {
  if (!(await bidContract.methods.canAdd(domainName).call())) {
    alert("Cannot add bid. Please check that the domain input is valid.");
    return
  }
  await bidContract.methods.addBid(domainName, commit).send({from: ethereum.selectedAddress});
  return
}

// Reveal bid, called only after validity check passes
export const revealBid = async(domainName, amount, salt) => {
  if (!(await bidContract.methods.canReveal(domainName).call())) {
    alert("Cannot reveal bid. Please check that the domain input is valid.");
    return
  }
  await bidContract.methods.revealBid(domainName, amount, salt).send({from: ethereum.selectedAddress});
  return
}

// Claim domain, called only after validity check passes
export const claimDomain = async(domainName, targetAddress, value) => {
  if (!(await bidContract.methods.canClaim(domainName).call())) {
    alert("Cannot claim domain. Please check that the domain input is valid.");
    return
  }
  await bidContract.methods.claimDomain(domainName, targetAddress).send({from: ethereum.selectedAddress, value: value});
  return
}

// Send ether to domain
export const sendEther = async(domainName, value) => {
  let domainOwner = await regContract.methods.getOwner(domainName).call();
  if (domainOwner == 0x0){
    alert("Cannot send ether to domain. Domain might not be registered or may have expired.");
    return
  }
  web3.eth.sendTransaction({
    from: ethereum.selectedAddress, to: domainOwner, value: value
  })
  .on('transactionHash', function(hash){
    console.log(`Transaction sent with hash ${hash}`);
  })
  .on('receipt', function(receipt){
    console.log(`Transaction receipt: ${receipt}`);
  })
  .on('confirmation', function(confirmationNumber, receipt){
    console.log(`${confirmationNumber} confirms, receipt: ${receipt}`);
  })
  .on('error', console.error);
}

export const updateBlockNumber = async() => {
  const blockNum = regContract.methods.currentBlock().call();
  return blockNum;
}

export const generateCommit = async(amount, salt) => {
  const commit = web3.utils.soliditySha3({t:'uint', v: amount}, {t:'string', v: salt});
  return commit;
}