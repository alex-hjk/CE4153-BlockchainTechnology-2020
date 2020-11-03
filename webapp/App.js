import React from "react";
import {
  RegistrarAddress,
  BidderAddress,
  Testnet,
  getRegisteredDomains,
  querySpecificDomain,
  queryAddress,
  queryBid,
  startBid,
  addBid,
  revealBid,
  claimDomain,
  generateCommit,
  updateBlockNumber,
  sendEther
} from "./domainRegistrar.js";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      registeredDomains: [],
      queryInput: "",
      queryName: "",
      queryAddress: "",
      queryExpiry: "",
      queryOutput: "",
      reverseQueryInput: "",
      reverseQueryAddress: "",
      reverseQueryDomains: [],
      bidQueryInput: "",
      bidQueryName: "",
      bidQueryCommitExpiry: "",
      bidQueryRevealExpiry: "",
      bidQueryClaimExpiry: "",
      bidQueryHighestBid: "",
      bidQueryHighestBidder: "",
      bidQueryActive: false,
      startNameInput: "",
      startHashInput: "",
      addNameInput: "",
      addHashInput: "",
      revealNameInput: "",
      revealValueInput: "",
      revealSaltInput: "",
      claimNameInput: "",
      claimValueInput: "",
      claimAddressInput: "",
      sendNameInput: "",
      sendValueInput: "",
      generateBidInput: "",
      generateSaltInput: "",
      generateSaltOutput: "",
      currentBlock: "",
    };

    // Bindings for inputs and buttons
    this.handleRefresh = this.handleRefresh.bind(this);

    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.handleQuery = this.handleQuery.bind(this);

    this.handleReverseQueryChange = this.handleReverseQueryChange.bind(this);
    this.handleReverseQuery = this.handleReverseQuery.bind(this);

    this.handleBidQueryChange = this.handleBidQueryChange.bind(this);
    this.handleBidQuery = this.handleBidQuery.bind(this);

    this.handleStartNameChange = this.handleStartNameChange.bind(this);
    this.handleStartHashChange = this.handleStartHashChange.bind(this);
    this.handleStart = this.handleStart.bind(this);

    this.handleAddNameChange = this.handleAddNameChange.bind(this);
    this.handleAddHashChange = this.handleAddHashChange.bind(this);
    this.handleAdd = this.handleAdd.bind(this);

    this.handleRevealNameChange = this.handleRevealNameChange.bind(this);
    this.handleRevealBidChange = this.handleRevealBidChange.bind(this);
    this.handleRevealSaltChange = this.handleRevealSaltChange.bind(this);
    this.handleReveal = this.handleReveal.bind(this);

    this.handleClaimNameChange = this.handleClaimNameChange.bind(this);
    this.handleClaimValueChange = this.handleClaimValueChange.bind(this);
    this.handleClaimAddressChange = this.handleClaimAddressChange.bind(this);
    this.handleClaim = this.handleClaim.bind(this);

    this.handleSendNameChange = this.handleSendNameChange.bind(this);
    this.handleSendValueChange = this.handleSendValueChange.bind(this);
    this.handleSend = this.handleSend.bind(this);

    this.handleGenerateBidChange = this.handleGenerateBidChange.bind(this);
    this.handleGenerateSaltChange = this.handleGenerateSaltChange.bind(this);
    this.handleGenerate = this.handleGenerate.bind(this);
  }

  // Handle refresh registered domain list
  handleRefresh = async () => {
    let registeredDomains = [];
    let addedDomains = await getRegisteredDomains();
    for (var i = 0; i < addedDomains.length; i++) {
      var {domainName, target, expiry} = addedDomains[i].returnValues;
      registeredDomains.push(<p>Domain: <b>{domainName}.ntu</b> &emsp; Address: {target} &emsp; Expiry: {expiry}</p>);
    }
    this.setState({
      registeredDomains: registeredDomains
    });
  }

  // Query domain functionality
  handleQueryChange = (e) => {
    this.setState({ queryInput: e.target.value });
  }
  handleQuery = async () => {
    let queryResult = await querySpecificDomain(this.state.queryInput);
    this.setState({
      queryName: this.state.queryInput,
      queryAddress: queryResult.owner,
      queryExpiry: queryResult.expiry,
    });
  }

  // Reverse lookup query functionality
  handleReverseQueryChange = (e) => {
    this.setState({ reverseQueryInput: e.target.value });
  }
  handleReverseQuery = async () => {
    let reverseQueryResult = await queryAddress(this.state.reverseQueryInput);
    let reverseQueryDomains = [];
    for (var i = 0; i < reverseQueryResult.length; i++){
      var {domainName, owner, expiry} = reverseQueryResult[i].returnValues;
      reverseQueryDomains.push(<p>Domain: <b>{domainName}.ntu</b> &emsp; Expiry: {expiry}</p>)
    }
    this.setState({
      reverseQueryAddress: this.state.reverseQueryInput,
      reverseQueryDomains: reverseQueryDomains
    });
  }

  // Query bidding info functionality
  handleBidQueryChange = (e) => {
    this.setState({ bidQueryInput: e.target.value });
  }
  handleBidQuery = async () => {
    let bidQueryResult = await queryBid(this.state.bidQueryInput);
    this.setState({
      bidQueryName: this.state.bidQueryInput,
      bidQueryCommitExpiry: bidQueryResult.commit,
      bidQueryRevealExpiry: bidQueryResult.reveal,
      bidQueryClaimExpiry: bidQueryResult.claim,
      bidQueryHighestBid: bidQueryResult.bid,
      bidQueryHighestBidder: bidQueryResult.bidder,
      bidQueryActive: bidQueryResult.status,
    });
  }

  // Start bid functionality
  handleStartNameChange = (e) => {
    this.setState({ startNameInput: e.target.value });
  }
  handleStartHashChange = (e) => {
    this.setState({ startHashInput: e.target.value });
  }
  handleStart = async () => {
    let startResult = await startBid(this.state.startNameInput, this.state.startHashInput);
  }

  // Add bid functionality
  handleAddNameChange = (e) => {
    this.setState({ addNameInput: e.target.value });
  }
  handleAddHashChange = (e) => {
    this.setState({ addHashInput: e.target.value });
  }
  handleAdd = async () => {
    let addResult = await addBid(this.state.addNameInput, this.state.addHashInput);
  }

  // Reveal bid functionality
  handleRevealNameChange = (e) => {
    this.setState({ revealNameInput: e.target.value });
  }
  handleRevealBidChange = (e) => {
    this.setState({ revealBidInput: e.target.value });
  }
  handleRevealSaltChange = (e) => {
    this.setState({ revealSaltInput: e.target.value });
  }
  handleReveal = async () => {
    let revealResult = await revealBid(this.state.revealNameInput, this.state.revealBidInput, this.state.revealSaltInput);
  }

  // Claim domain functionality
  handleClaimNameChange = (e) => {
    this.setState({ claimNameInput: e.target.value });
  }
  handleClaimValueChange = (e) => {
    this.setState({ claimValueInput: e.target.value });
  }
  handleClaimAddressChange = (e) => {
    this.setState({ claimAddressInput: e.target.value });
  }
  handleClaim = async () => {
    let claimResult = await claimDomain(this.state.claimNameInput, this.state.claimAddressInput, this.state.claimValueInput);
  }

  // Send ether functionality
  handleSendNameChange = (e) => {
    this.setState({ sendNameInput: e.target.value });
  }
  handleSendValueChange = (e) => {
    this.setState({ sendValueInput: e.target.value });
  }
  handleSend = async () => {
    let result = await sendEther(this.state.sendNameInput, this.state.sendValueInput);
  }

  // Generate bid commit hash functionality
  handleGenerateBidChange = (e) => {
    this.setState({ generateBidInput: e.target.value });
  }
  handleGenerateSaltChange = (e) => {
    this.setState({ generateSaltInput: e.target.value });
  }
  handleGenerate = async () => {
    let generateResult = await generateCommit(this.state.generateBidInput, this.state.generateSaltInput);
    this.setState({ generateSaltOutput: generateResult})
  }

  // Block number update functionality
  handleBlockUpdate = async () => {
    let updateBlockResult = await updateBlockNumber();
    this.setState({ currentBlock: updateBlockResult})
  }

  render() {
    // Layout: Registered, Query Domain, Query Bid, New, Add, Reveal, Claim, Send, Generate
    return (
      <>
        <h1>Bitalik Sakamoto's .ntu Domain Registrar</h1>
        <p>Registrar Contract Address: {RegistrarAddress}</p>
        <p>Bidder Contract Address: {BidderAddress}</p>
        <p>Network: {Testnet}</p>
        <p>Current block number: {this.state.currentBlock}</p>
        <input type="submit" value="Update Block Number" onClick={this.handleBlockUpdate} />
        <hr />

        <h2>Registered Domains</h2>
        <input type="submit" value="Refresh" onClick={this.handleRefresh} />
        {this.state.registeredDomains}
        <hr />

        <h2>Query Domain Registration</h2>
        <input
          type="text"
          placeholder="Enter Domain to query"
          value={this.state.queryValue}
          onChange={this.handleQueryChange}
          style={{width: "250px"}}
        />{"  "}
        <input type="submit" value="Query Domain" onClick={this.handleQuery} />
        {this.state.queryName &&
        <>
          <p>
            Query result: Domain <b>{this.state.queryName}.ntu</b> resolves to {this.state.queryAddress} and expires at block number {this.state.queryExpiry}.
          </p>
        </>
        }
        <hr />

        <h2>Query Address (Reverse Lookup)</h2>
        <input
          type="text"
          placeholder="Enter Address to query"
          value={this.state.reverseQueryValue}
          onChange={this.handleReverseQueryChange}
          style={{width: "250px"}}
        />{"  "}
        <input type="submit" value="Query Address" onClick={this.handleReverseQuery} />
        {this.state.reverseQueryDomains}
        <hr />

        <h2>Query Bid Status</h2>
        <input
          type="text"
          placeholder="Enter Domain to query"
          value={this.state.bidQueryValue}
          onChange={this.handleBidQueryChange}
          style={{width: "250px"}}
        />{"  "}
        <input type="submit" value="Query Bid" onClick={this.handleBidQuery} />
        {this.state.bidQueryName &&
          <>
            <p>
              Query result for domain: <b>{this.state.bidQueryName}.ntu</b>
            </p>
            <ul>
              <li>Commit expiry: {this.state.bidQueryCommitExpiry}</li>
              <li>Reveal expiry: {this.state.bidQueryRevealExpiry}</li>
              <li>Claim expiry: {this.state.bidQueryClaimExpiry}</li>
              <li>Highest bid (eth): {this.state.bidQueryHighestBid}</li>
              <li>Highest bidder: {this.state.bidQueryHighestBidder}</li>
              <li>Bid is active: {String(this.state.bidQueryActive)}</li>
            </ul>
          </>
        }
        <hr />

        <h2>Start New Auction</h2>
        <input
          type="text"
          placeholder="Enter Domain to start an auction for"
          value={this.state.startNameValue}
          onChange={this.handleStartNameChange}
          style={{width: "250px"}}
        />{"  "}
          <input
          type="text"
          placeholder="Enter bid commit hash"
          value={this.state.startHashValue}
          onChange={this.handleStartHashChange}
          style={{width: "350px"}}
        />{"  "}
        <input type="submit" value="Start Auction" onClick={this.handleStart} />
        <hr />

        <h2>Add Bid</h2>
        <input
          type="text"
          placeholder="Enter Domain to add a bid for"
          value={this.state.addValue}
          onChange={this.handleAddNameChange}
          style={{width: "250px"}}
        />{"  "}
        <input
          type="text"
          placeholder="Enter bid commit hash"
          value={this.state.addHashValue}
          onChange={this.handleAddHashChange}
          style={{width: "350px"}}
        />{"  "}
        <input type="submit" value="Add Bid" onClick={this.handleAdd} />
        <hr />

        <h2>Reveal Bid</h2>
        <input
          type="text"
          placeholder="Enter Domain name to reveal bid for"
          value={this.state.revealNameValue}
          onChange={this.handleRevealNameChange}
          style={{width: "250px"}}
        />{"  "}
          <input
          type="text"
          placeholder="Enter bid value (eth)"
          value={this.state.revealBidValue}
          onChange={this.handleRevealBidChange}
          style={{width: "250px"}}
        />{"  "}
          <input
          type="text"
          placeholder="Enter commit secret value"
          value={this.state.revealSaltValue}
          onChange={this.handleRevealSaltChange}
          style={{width: "250px"}}
        />{"  "}
        <input type="submit" value="Reveal Bid" onClick={this.handleReveal} />
        <hr />

        <h2>Claim Domain</h2>
        <input
          type="text"
          placeholder="Enter Domain name to claim"
          value={this.state.claimNameInput}
          onChange={this.handleClaimNameChange}
          style={{width: "250px"}}
        />{"  "}
          <input
          type="text"
          placeholder="Enter amount value (eth)"
          value={this.state.claimValueInput}
          onChange={this.handleClaimValueChange}
          style={{width: "250px"}}
        />{"  "}
          <input
          type="text"
          placeholder="Enter claim address"
          value={this.state.claimAddressInput}
          onChange={this.handleClaimAddressChange}
          style={{width: "250px"}}
        />{"  "}
        <input type="submit" value="Claim Domain" onClick={this.handleClaim} />
        <hr />

        <h2>Send Ether to Domain</h2>
        <input
          type="text"
          placeholder="Enter Domain to send ether to"
          value={this.state.sendNameInput}
          onChange={this.handleSendNameChange}
          style={{width: "250px"}}
        />{"  "}
          <input
          type="text"
          placeholder="Enter amount value (eth)"
          value={this.state.sendValueInput}
          onChange={this.handleSendValueChange}
          style={{width: "250px"}}
        />{"  "}
        <input type="submit" value="Send Ether" onClick={this.handleSend} />
        <hr />

        <h2>Generate Bid Commit</h2>
        <input
          type="text"
          placeholder="Enter bid value (eth)"
          value={this.state.generateBidInput}
          onChange={this.handleGenerateBidChange}
          style={{width: "250px"}}
        />{"  "}
          <input
          type="text"
          placeholder="Enter commit secret value"
          value={this.state.generateSaltInput}
          onChange={this.handleGenerateSaltChange}
          style={{width: "250px"}}
        />{"  "}
        <input type="submit" value="Generate Bid Commit" onClick={this.handleGenerate} />
        <p>
          Generated bid commit hash: {this.state.generateSaltOutput}
        </p>
        <hr />
      </>
    );
  }
}

export default App;
