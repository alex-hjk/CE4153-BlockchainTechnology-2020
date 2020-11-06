# CE4153 Development Project: Decentralised Domain Registrar
## Overview
This project is a domain name registrar service running on Ethereum, using a "commit-and-reveal" bidding process to implement a fair, open, and transparent on-chain domain auction system.

## Solution Details
Users may bid for a unregistered or expired domain name in the registrar through a "commit-and-reveal" blind auction bidding process. The bidding process occurs in 3 phases - **commit, reveal, claim**. All 3 phases will last for a set number of blocks. For the sake of demonstration, each phase lasts for 3 blocks.

During the commit phase, any bidders may add a new bid for a domain. Each address may only hold one bid's hash commit for each domain, and addding a new bid will simply update and replace the existing bid. During this phase, bidders will not know the value of bids from other bidders as only the hash commit of the bid is stored.

During the reveal phase, new bids are no longer allowed, and bidders who have bidded during the commit phase may choose to reveal their bids through the hash commit of their bid value and salt. During this phase, information regarding the highest bidder and bid value will be publicly visible. Whenever a higher bid value is revealed, the bid info for that domain is updated. In the case of a tie in bid value, the bidder who made the commit in an earlier block number will break the tie and win the auction.

During the claim phase, only the address of the highest bidder will be able to claim the domain and register that domain to a target address. During this phase, the highest bidder will also have to send ether value of value greater than or equal to his bid value. Any excess ether is refunded back. In the case where the domain is unclaimed, the bid will expire and the domain will remain unregistered, open for a new round of bidding.

## Smart Contracts
The registrar is powered by two smart contracts written in Solidity.
- Registrar.sol
    - Domain name registrar storage functionality
    1. Mapping `domains` maps the domain name string to the `Domain` struct.
    2. `Domain` struct stores the domain owner and expiry information.
    3. Function `addDomain` handles the registration of a new domain into the registrar, and may only be called by the bidder through the modifier `onlyBidder`.
    4. Function `removeDomain` handles the deregistration of an existing domain from the registrar, and may only be caleld by the owner of the contract of the bidder.
    5. Events `AddDomain` and `RemoveDomain` are defined and emitted whenever a domain is added or removed so that the frontend can update the state of the registered domains.
- Bidder.sol
    - Domain name bidding and claiming functionality
    1. Mapping `bids` maps the domain name string to the `Bidding` struct.
    2. `Bidding` struct stores another mapping `commits` that maps the sender address to the `Commit` struct. `Bidding` also contains additional bid information for each domain.
    3. `Commit` struct stores the commit hash as well as the block number of the commit.
For Ownership and Access control:
- Ownable.sol
For Truffle deployment:
- Migrations.sol

## User Interface
The user interface is a simple [React](https://reactjs.org/) App.

## Installation

### Prerequisities

### Setup
```
```
### Deployment
```
```
### Testing
Testing is done with Truffle to ensure correct contract functionality in all possible user flows. The following test cases are covered:
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
