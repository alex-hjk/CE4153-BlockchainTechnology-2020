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
      address: "0x0",
      expiry: 0,
    };

    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.handleQuery = this.handleQuery.bind(this);
  }
  handleQueryChange = (e) => {
    this.setState({ queryInput: e.target.value });
  };
  handleQuery = async () => {
    let result = await querySpecificDomain(this.state.queryInput);
    this.setState({
      address: result.owner,
      expiry: result.expiry,
    });
  };

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
        />{" "}
        <input type="submit" value="Query Deposit" onClick={this.handleQuery} />
        <p>
          Query Result: Domain {this.state.queryInput} resolves to {this.state.address} and expires at block number {this.state.expiry}.
        </p>
        <hr />

        <h2>Start New Bid</h2>
        <hr />

        <h2>Add Bid</h2>
        <hr />

        <h2>Reveal Bid</h2>
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
