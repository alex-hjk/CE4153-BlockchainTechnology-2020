import Web3 from "web3";

// Import compiled contract artifacts for function interaction
import RegistrarArtifact from "../build/contracts/Registrar.json";
import BidderArtifact from"../build/contracts/Bidder.json"
import { isAddress } from "web3-utils";

// Contract setup - to update after every Truffle migration
export const RegistrarAddress = "0xA69b6d53A270b0cD988609b742c5Ac6541b298B3";
export const BidderAddress = "0x7e7Ffac959E0183EfdBaD3899b73E665a21FF128";

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
  console.log(event.returnValues);
  console.log(`Domain ${domainName} added. Target: ${target}, Expiry: ${domainExpiry}.`);
})
.on('error', console.error);

regContract.events.RemoveDomain()
.on('data', function(event){
  var {domainName, target, domainExpiry} = event.returnValues;
  console.log(`Domain ${domainName} deleted. Target: ${target}, Expiry: ${domainExpiry}.`);
})
.on('error', console.error);

// Bidder Listeners
bidContract.events.StartBid()
.on('data', function(event){
  var {domainName, bidder} = event.returnValues;
  console.log(`Bid for domain ${domainName} started by ${bidder}.`);
})
.on('error', console.error);

bidContract.events.ClaimDomain()
.on('data', function(event){
  var {domainName, bidder, target} = event.returnValues;
  console.log(`Domain ${domainName} claimed by ${bidder} resolves to ${target}.`);
})
.on('error', console.error);

// Obtain registered domains by searching past emitted events
export const getRegisteredDomains = async() => {
  let addedDomains = await regContract.getPastEvents("AddDomain", { fromBlock: 1});
  return addedDomains;
}

// Query domain registration information
export const querySpecificDomain = async (domainName) => {
  const {domainOwner, domainExpiry} = await regContract.methods.getSpecificDomainDetails(domainName).call();
  return { owner: domainOwner, expiry: domainExpiry };
};

// Reverse query from address to domain(s) by searching past emitted events
export const queryAddress = async (address) => {
  if (!(isAddress(address))){
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
  return { commit: commitExp, reveal: revealExp, claim: claimExp, bid: web3.utils.fromWei(highBid, 'ether'), bidder: highBidder, status: active };
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
  await bidContract.methods.revealBid(domainName, web3.utils.toWei(amount, 'ether'), salt).send({from: ethereum.selectedAddress});
  return
}

// Claim domain, called only after validity checks pass
export const claimDomain = async(domainName, targetAddress, value) => {
  if (!(await bidContract.methods.checkHighestBidder(domainName, ethereum.selectedAddress).call())) {
    alert("Cannot claim domain. Please check that the claiming address is valid.")
    return
  } else if (!(await bidContract.methods.canClaim(domainName).call())) {
    alert("Cannot claim domain. Please check that the domain input is valid.");
    return
  } else if (!(isAddress(targetAddress))){
    alert("Cannot claim domain. Please check that the address input is valid.");
    return
  }
  await bidContract.methods.claimDomain(domainName, targetAddress).send({from: ethereum.selectedAddress, value: web3.utils.toWei(value, 'ether')});
  return
}

// Send ether to domain
export const sendEther = async(domainName, value) => {
  let domainOwner = await regContract.methods.getOwner(domainName).call();
  console.log(domainOwner);
  if (domainOwner == 0x0){
    alert("Cannot send ether to domain. Domain might not be registered or may have expired.");
    return
  }
  web3.eth.sendTransaction({
    from: ethereum.selectedAddress, to: domainOwner, value: web3.utils.toWei(value, 'ether')
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

// Fetches current block number
export const updateBlockNumber = async() => {
  const blockNum = regContract.methods.currentBlock().call();
  return blockNum;
}

// Generates commit hash using web3.utils to match solidity encodePacked
export const generateCommit = async(amount, salt) => {
  const commit = web3.utils.soliditySha3({t:'uint', v: web3.utils.toWei(amount, 'ether')}, {t:'string', v: salt});
  return commit;
}