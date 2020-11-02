import React from "react";
import {
  querySpecificDomain,
  generateCommit,
  RegistrarAddress,
  BidderAddress,
  Testnet,
} from "./domainRegistrar.js";

// example from doc: https://reactjs.org/docs/forms.html#controlled-components
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      queryInput: "",
      startNameInput: "",
      startValueInput: "",
      startSaltInput: "",
      addNameInput: "",
      addValueInput: "",
      addSaltInput: "",
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
      address: "0x0",
      expiry: 0,
    };
    
    // Bindings for inputs and buttons
    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.handleQuery = this.handleQuery.bind(this);

    this.handleGenerateBidChange = this.handleGenerateBidChange.bind(this);
    this.handleGenerateSaltChange = this.handleGenerateSaltChange.bind(this);
    this.handleGenerate = this.handleGenerate.bind(this);
  }

  // Query domain functionality
  handleQueryChange = (e) => {
    this.setState({ queryInput: e.target.value });
  }
  handleQuery = async () => {
    let result = await querySpecificDomain(this.state.queryInput);
    this.setState({
      address: result.owner,
      expiry: result.expiry,
    });
  }

  // Start bid functionality
  handleStartNameChange = (e) => {
    this.setState({ startNameInput: e.target.value });
  }
  handleStartValueChange = (e) => {
    this.setState({ startValueInput: e.target.value });
  }
  handleStartSaltChange = (e) => {
    this.setState({ startSaltInput: e.target.value });
  }
  handleStart = async () => {
    let result = await startBid(this.state.startNameInput, this.state.startValueInput);
  }

  // Add bid functionality
  handleAddNameChange = (e) => {
    this.setState({ addNameInput: e.target.value });
  }
  handleAddValueChange = (e) => {
    this.setState({ addValueInput: e.target.value });
  }
  handleAddSaltChange = (e) => {
    this.setState({ addSaltInput: e.target.value });
  }
  handleAdd = async () => {
    let result = await addBid(this.state.addNameInput, this.state.addValueInput);
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
  handleAdd = async () => {
    let result = await revealBid(this.state.revealNameInput, this.state.revealBidInput, this.state.revealSaltInput);
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
    let result = await claimDomain(this.state.claimNameInput, this.state.claimAddressInput, this.state.claimValueInput);
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

  render() {
    // Layout: Registered, Query, New, Add, Reveal, Claim, Send, Generate
    return (
      <>
        <h1>Welcome to Bitalik Sakamoto's Domain Registrar dApp</h1>
        <p>Registrar Contract Address: {RegistrarAddress}</p>
        <p>Bidder Contract Address: {BidderAddress}</p>
        <p>Network: {Testnet}</p>
        <hr />

        <h2>Registered Domains</h2>
        <hr />

        <h2>Query Domain</h2>
        <input
          type="text"
          placeholder="Enter Domain to query"
          value={this.state.value}
          onChange={this.handleQueryChange}
          style={{width: "250px"}}
        />{"  "}
        <input type="submit" value="Query Deposit" onClick={this.handleQuery} />
        <p>
          Query Result: Domain {this.state.queryInput} resolves to {this.state.address} and expires at block number {this.state.expiry}.
        </p>
        <hr />

        <h2>Start New Bid</h2>
        <input
          type="text"
          placeholder="Enter Domain to start a bid for"
          value={this.state.startNameValue}
          onChange={this.handleStartNameChange}
          style={{width: "250px"}}
        />{"  "}
        <input
          type="text"
          placeholder="Enter bid value"
          value={this.state.startValueInput}
          onChange={this.handleStartValueChange}
          style={{width: "350px"}}
        />{"  "}
        <input
          type="text"
          placeholder="Enter commit secret value"
          value={this.state.startSaltInput}
          onChange={this.handleStartSaltChange}
          style={{width: "250px"}}
        />{"  "}
        <input type="submit" value="Start Bid" onClick={this.handleStart} />
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
          placeholder="Enter bid value"
          value={this.state.addValueInput}
          onChange={this.handleAddValueChange}
          style={{width: "350px"}}
        />{"  "}
        <input
          type="text"
          placeholder="Enter commit secret value"
          value={this.state.addSaltInput}
          onChange={this.handleAddSaltChange}
          style={{width: "250px"}}
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
          placeholder="Enter bid value"
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
          placeholder="Enter amount value (wei)"
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
          placeholder="Enter amount value (wei)"
          value={this.state.sendValueInput}
          onChange={this.handleSendValueChange}
          style={{width: "250px"}}
        />{"  "}
        <input type="submit" value="Send Ether" onClick={this.handleSend} />
        <hr />

        <h2>Generate Bid Commit</h2>
        <input
          type="text"
          placeholder="Enter bid amount value (wei)"
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
