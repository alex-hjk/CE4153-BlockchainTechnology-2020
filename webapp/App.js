import React from "react";
import {
  querySpecificDomain,
  DomainRegistrarAddress,
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
    return (
      <>
        <h1>Welcome to Bitalik Sakamoto's Domain Registrar dApp</h1>
        <p>Domain Registrar Contract Address: {DomainRegistrarAddress}</p>
        <p>Network: {Testnet}</p>
        <hr />
        <input
          type="text"
          placeholder="Enter Domain to query"
          value={this.state.value}
          onChange={this.handleQueryChange}
        />{" "}
        <input type="submit" value="Query Deposit" onClick={this.handleQuery} />
        <p>
          Query Result: Domain {this.state.queryInput} belongs to {this.state.address} and expires at block number {this.state.expiry}.
        </p>
        <hr />
      </>
    );
  }
}

export default App;
