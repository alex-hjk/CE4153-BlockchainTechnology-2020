import { useState, useRef, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";

// NOTE: be aware of this: https://flaviocopes.com/parcel-regeneratorruntime-not-defined/
import Web3 from "web3";

// Import compiled contract artifacts for function interaction
import RegistrarArtifact from "../build/contracts/Registrar.json";
import BidderArtifact from"../build/contracts/Bidder.json"

// Contract setup - to update after deployment
export const RegistrarAddress = "0xB280Db02eFdb0c940926d7B92F9Fc24aBffaa9C2";
export const BidderAddress = "";

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
const contract = new web3.eth.Contract(RegistrarArtifact.abi, RegistrarAddress);
const contract = new web3.eth.Contract(BidderArtifact.abi, BidderAddress);

export const querySpecificDomain = async (domainName) => {
  const {domainOwner, domainExpiry} = await contract.methods.getSpecificDomainDetails(domainName).call({ from: addr });
  return { owner: domainOwner, expiry: domainExpiry };
};