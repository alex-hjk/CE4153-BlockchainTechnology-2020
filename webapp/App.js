import React from "react";
import {
  querySpecificDomain,
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
      startHashInput: "",
      addNameInput: "",
      addHashInput: "",
      revealNameInput: "",
      revealValueInput: "",
      revealSaltInput: "",
      claimInput: "",
      sendInput: "",
      address: "0x0",
      expiry: 0,
    };

    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.handleQuery = this.handleQuery.bind(this);
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
  handleStartHashChange = (e) => {
    this.setState({ startHashInput: e.target.value });
  }
  handleStart = async () => {
    let result = await startBid(this.state.startNameInput, this.state.startHashInput);
  }

    // Add bid functionality
    handleAddNameChange = (e) => {
      this.setState({ addNameInput: e.target.value });
    }
    handleAddHashChange = (e) => {
      this.setState({ addHashInput: e.target.value });
    }
    handleAdd = async () => {
      let result = await addBid(this.state.addNameInput, this.state.addHashInput);
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
      let result = await addBid(this.state.revealNameInput, this.state.revealBidInput, this.state.revealSaltInput);
    }

  render() {
    // Layout: Registered, Query, New, Add, Reveal, Claim, Send
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
          placeholder="Enter bid commit hash"
          value={this.state.startHashValue}
          onChange={this.handleStartHashChange}
          style={{width: "350px"}}
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
        <hr />

        <h2>Send Ether to Domain</h2>
        <hr />
      </>
    );
  }
}

export default App;
