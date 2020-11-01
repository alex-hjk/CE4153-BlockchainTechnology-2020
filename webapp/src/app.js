import Web3 from "web3";
import registrarArtifact from "../../build/contracts/Registrar.json";
import bidderArtifact from "../../build/contracts/Bidder.json";

const PROTOCOL = "http://";
const HOST = "127.0.0.1";
const PORT = "7545";
const URL = `${PROTOCOL}${HOST}:${PORT}`;

class App {
  constructor(web3) {
    this._web3 = web3;
    this._account = null;
    this._domainRegistry = null;
    this._listeners = {};
  }

  async init() {
    this._account = (await this.getAccount()).address;    //by default set account[0] as the main acc
    const netId = await this._web3.eth.net.getId();       //connect to Registrar
    const network = registrarArtifact.networks[netId];
    this.connectDomainRegistry(network.address);

    this._web3.eth.handleRevert = true;                   //enable revert errors

    //subscribe to Domain Registry events
    this._domainRegistry.events.allEvents({}, (err, obj) => {
      const listeners = this._listeners[obj.event];
      if (err || listeners === undefined) return;
      listeners.forEach(l => l(obj.returnValues));
      console.log({ e: obj.event, ...obj.returnValues });
    });
  }

  subscribe(event, callback) {
    if (this._listeners[event] === undefined) this._listeners[event] = [];
    this._listeners[event].push(callback);
  }


  //returns address of auction
  async startAuction(domain) {
    return this._domainRegistry
      .methods
      .startAuction(domain)
      .send({
        from: this._account,
        value: 0,
      });
  }

  //returns accounts: array of {address: string, balance: number}
  async getAccount() {
    const eth = this._web3.eth;
    const accounts = await eth.getAccounts();
    const balance = (await eth.getBalance(accounts[0]))/1000000000000000000;
    return { address: accounts[0], balance };
  }

  async getAuctionState(domain) {
    const address = await this._getAddressFor(domain);
    //TODO: remove
  }

  async sendEther(domain, valueInWei) {
    const address = await this._getAddressFor(domain);
    this._web3.eth.sendTransaction({
      from: this._account,
      to: address,
      value: valueInWei,
    });
  }

  setAccount(address) {
    this._account = address;
  }

  connectDomainRegistry(address) {
    this._domainRegistry = this._getContract(registrarArtifact, address);
  }

  async getAuctionStage(address) {
    const auction = this._getContract(bidderArtifact, address);
    return auction.methods.getStage().call();
  }

  _getContract(artifact, address) {
    return new this._web3.eth.Contract(artifact.abi, address);
  }

  //returns address of domain
  async _getAddressFor(domain) {
    return this._domainRegistry.methods.resolveDomain(domain).call();
  }

  async _getBlindAuctionFor(domain) {
    const address = await this._getAddressFor(domain);
    return this._getContract(bidderArtifact, address);
  }
}

function Bid(valueInWei, isFake, secret) {
  this.value = valueInWei;
  this.isFake = isFake;
  this.secret = secret;
}

async function getApi() {
  let web3;

  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    window.ethereum.enable()
  } else {
    console.warn(`No web3 detected, falling back on ${URL}.`);
    web3 = new Web3(new Web3.providers.HttpProvider(URL))
  }

  const app = new App(web3);
  await app.init();
  return app;
}

export {
  getApi,
  Bid,
}