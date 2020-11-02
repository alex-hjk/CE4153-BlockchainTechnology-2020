import { useState, useRef, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
// NOTE: be aware of this: https://flaviocopes.com/parcel-regeneratorruntime-not-defined/
import Web3 from "web3";

// importing a compiled contract artifact which contains function signature etc. to interact
import artifact from "../build/contracts/Registrar.json";

const myAddress = "0xcc6b9a2Ef844002c413d992B980EeB7b08899A10"; // PLEASE CHANGE IT TO YOURS
const infuraWSS = `wss://ropsten.infura.io/ws/v3/dfe7b73d377740b69fefd0ed7a8b104d`; // PLEASE CHANGE IT TO YOURS
const localGanache = "http://127.0.0.1:7545" // Local Ganache RPC address

export const DomainRegistrarContractAddress = "0xB280Db02eFdb0c940926d7B92F9Fc24aBffaa9C2"; // PLEASE CHANGE IT TO YOURS
export const Testnet = "ropsten"; // PLEASE CHANGE IT TO YOURS

// Set up web3 provider
let web3;

if (window.ethereum) {
  web3 = new Web3(window.ethereum);
  window.ethereum.enable();
} else {
  console.warn(`No web3 detected, falling back on external provider.`);
  web3 = new Web3(new Web3.providers.HttpProvider(localGanache));
}

// doc here: https://web3js.readthedocs.io/en/v1.2.11/web3.html#providers
const contract = new web3.eth.Contract(artifact.abi, DomainRegistrarContractAddress);

export const querySpecificDomain = async (domainName) => {
  // doc here: https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-call
  const {domainOwner, domainExpiry} = await contract.methods.getSpecificDomainDetails(domainName).call({ from: addr });
  return { owner: domainOwner, expiry: domainExpiry };
};