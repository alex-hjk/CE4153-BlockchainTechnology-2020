# CE4153 Development Project: Decentralised Domain Registrar
## Overview
This project is a domain name registrar service running on Ethereum, using a "commit-and-reveal" bidding process to implement a fair, open, and transparent on-chain domain auction system.

## Solution Details
Users may bid for an unregistered or expired domain name in the registrar through a "commit-and-reveal" blind auction bidding process. The bidding process occurs in 3 phases - **commit, reveal, claim**. All 3 phases will last for a set number of blocks. For the sake of demonstration, each phase lasts for **3 blocks**.

During the *commit* phase, any bidders may add a new bid for a domain. Each address may only hold one bid's hash commit for each domain, and addding a new bid will simply update and replace the existing bid. During this phase, bidders will not know the value of bids from other bidders as only the hash commit of the bid is stored.

During the *reveal* phase, new bids are no longer allowed, and bidders who have bidded during the commit phase may choose to reveal their bids through the hash commit of their bid value and salt. During this phase, information regarding the highest bidder and bid value will be publicly visible. Whenever a higher bid value is revealed, the bid info for that domain will be updated. In the case of a tie in bid value, the bidder who made the commit in an earlier block number will break the tie and win the auction.

During the *claim* phase, only the address of the highest bidder will be able to claim the domain and register that domain to a target address. During this phase, the highest bidder will also have to send ether of value greater than or equal to his bid value. Any excess ether is refunded back. In the case where the domain is unclaimed, the bid will expire and the domain will remain unregistered, open for a new round of bidding.

## Smart Contracts
The registrar is powered by two smart contracts written in Solidity.
- Registrar.sol
    - Domain name registrar storage functionality
    1. Mapping `domains` maps the domain name string to the `Domain` struct.
    2. `Domain` struct stores the domain owner and expiry information.
    3. Function `addDomain` handles the registration of a new domain into the registrar, and may only be called by the bidder contract through the modifier `onlyBidder`.
    4. Function `removeDomain` handles the deregistration of an existing domain from the registrar, and may only be called by the owner or the contract of the bidder.
    5. Events `AddDomain` and `RemoveDomain` are defined and emitted whenever a domain is added or removed so that the frontend can update the state of the registered domains.
- Bidder.sol
    - Domain name bidding and claiming functionality
    1. Mapping `bids` maps the domain name string to the `Bidding` struct.
    2. `Bidding` struct stores another mapping `commits` that maps the sender address to the `Commit` struct. `Bidding` also contains additional bid information for each domain.
    3. `Commit` struct stores the commit hash as well as the block number of the commit.

For Ownership and Access control (from OpenZeppelin):
- Ownable.sol

For Truffle deployment:
- Migrations.sol

## User Interface
The user interface is a simple [React](https://reactjs.org/) App.
![UIScreenshot](/images/frontendScr.png?raw=true "Screenshot")

**Update Block Number** simply queries the latest block number from the blockchain and updates the *Current block number* field on the web page.

**Advance Block** simply sends a transaction to the blockchain in order to manually advance the block number by one. This is necessary for our local deployment where blocks are mined only when a non-view function is called on the blockchain.

**Refresh** refreshes the *Registered Domains* section to view the list of updated, non-expired registered domains.

**Query Domain** searches the list of registered domains to return the owner address and block number expiry of the queried domain.

**Query Address** is a reverse lookup that searches the list of registered domains to return all domains, and their corresponding block number expiry, registered to the specified address.

**Start Auction** allows a user to start the auction bidding process for an inactive domain. An inactive domain is one that is either currently unregistered or expired, and a previous auction has not already been initiated.

**Add Bid** allows a user to add a new bid/update their existing bid for a domain that is currently active in the auction process.

**Reveal Bid** allows users who previously bidded to reveal their bid value through the hash commit of their bid *value* and *secret*.

**Claim Domain** allows the highest bidder to claim the domain name to a target address.

**Send Ether** allows a user to send ether to the address owner of the specified domain.

**Generate Bid Commit** is a helper function that allows users to generate a hash of their bid *value* and *secret* to be used for their bid commits.

## Installation

### Prerequisities
- [NodeJS](https://nodejs.org/en/): environment for Javascript applications
- [Ganache](https://www.trufflesuite.com/ganache): local blockchain setup
- [Truffle](https://www.trufflesuite.com/truffle): contract compilation, migration and testing
- [MetaMask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en): blockchain interaction

### Setup and Deployment
- Set up Ganache
    - Open Ganache and select *New Workspace*.
    - Set a name for *Workspace Name*.
    - Under *Truffle Projects*, drag and drop the ```truffle-config.js``` file located in the *decentralised-domain-registrar* folder into the box.
    - Add project.
- Compile and deploy contracts
    ```
    cd decentralised-domain-registrar   // enter main project folder
    npm install                         // install dependencies
    truffle compile                     // compile contracts using Truffle
    truffle migrate                     // deploy contracts using Truffle
    ```
- Update contract addresses
    - Obtain the deployed Registrar and Bidder addresses from the *Contracts* tab in Ganache.
    - Copy and paste each address into `RegistrarAddress` and `BidderAddress` respectively in `webapp/domainRegistrar.js`, replacing previous values.

- Set up application front-end
    ```
    cd webapp       // enter front-end folder
    npm install     // install dependencies
    npm start       // start application
    ```
- Connect MetaMask to Ganache
    - Open the web browser and start the MetaMask browser extension.
    - If a MetaMask account is already active, log out or disable and re-enable the MetaMask browser extension.
    - Select *Import using account seed phrase*.
    - Under *Wallet Seed*, go back to Ganache, copy the *Mnemonic* seed phrase near the top of the workspace page and paste it into the box.
    - Set a password.
    - Restore the account from Ganache.
    - Under *Networks*, select *Custom RPC*.
    - Set a network name.
    - Under *New RPC URL*, go back to Ganache, copy the *RPC Server* address near the top of the workspace page and paste it into the box.
    - Under *Chain ID*, type in an numeric value, try to save the network, copy the chain ID beginning with *0x* returned with the error and paste it into the box.
    - Save the network.
    - Verify that the accounts in the MetaMask account are the same as the accounts reflected in Ganache.
- Open application
    - Access the application at ```http://localhost:1234```.
    - MetaMask should automatically connect to the application site.

### Re-deployment
- Re-deploy contracts
    ```
    cd decentralised-domain-registrar   // enter main project folder
    truffle migrate --reset             // re-deploy contracts using Truffle
    ```
- Update front-end addresses
    - Obtain the updated Registrar and Bidder addresses from the *Contracts* tab in Ganache.
    - Copy and paste each address into `RegistrarAddress` and `BidderAddress` respectively in `webapp/domainRegistrar.js`, replacing previous values.

- Restart application front-end
    ```
    cd webapp   // enter front-end folder
    npm start   // restart application
    ```

### Testing
Testing is done with Truffle to ensure correct contract functionality in all possible user flows.

![TestingScreenshot](/images/testResults.png?raw=true "Test Cases")

The following test cases are covered:
```
- bidder utils
    - should be able to compute generated hash
    - should be able to return block number
    - should be able to withdraw bidder balance to contract owner
    - should not be able to withdraw bidder balance to non-contract owner
- registrar utils
    - should be able to return block number
- bidder parameters
    - should be able to set commit length
    - should be able to set reveal length
    - should be able to set claim length
- registrar parameters
    - should be able to set bidder address by owner
    - should not be able to set bidder address by non-owner
    - should be able to set default domain expiry by owner
    - should not be able to set default domain expiry by non-owner
- start new bid
    - should be able to start new bid
    - should not be able to start new bid during commit phase
    - should not be able to start new bid during reveal phase
    - should not be able to start new bid during claim phase
    - should be able to start new bid after claim phase and domain unclaimed
    - should not be able to start new bid after claim phase and domain claimed
    - should be able to start new bid after domain expired
- add bid
    - should be able to add bid during commit phase
    - should not be able to add bid without new bid started
    - should not be able to add bid during reveal phase
    - should not be able to add bid during claim phase
- reveal bid
    - should be able to reveal bid during reveal phase
    - should let earlier bidder be winner in event of same highest bids
    - should not be able to reveal bid during commit phase
    - should not be able to reveal bid during claim phase
- claim domain
    - should be able to claim domain during claim phase as the winning bidder
    - should be able to claim domain during claim phase and recieve excess fee
    - should be not able to claim domain if post-gas value sent is less than highest bid
    - should not be able to claim domain during commit phase
    - should not be able to claim domain during reveal phase
```