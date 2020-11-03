# CE4153 Development Project: Decentralised Domain Registrar
## Overview
This project is a domain name registrar service running on Ethereum, using a "commit-and-reveal" bidding process to implement a fair, open, and transparent on-chain domain auction system.

## Smart Contracts
The registrar is powered by two smart contracts written in Solidity.
- Registrar.sol
    - Domain name registrar storage functionality
- Bidder.sol
    - Domain name bidding and claiming functionality

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
