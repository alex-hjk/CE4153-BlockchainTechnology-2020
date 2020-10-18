// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.8.0;

contract Registrar {
    // ******** Domain storage ********
    struct Domain {
        address domainOwner;
        uint domainExpiry;      // domain expiry block number
    }

    // Create mapping from domain name string to domain info struct
    mapping (string => Domain) public domains;

    // Commit domain to registrar after claimed bid
    function addDomain(string memory _name, address _owner, uint _expiry ) public {
        Domain storage d = domains[_name];
        d.domainOwner = _owner;
        d.domainExpiry = _expiry;
    }

    // Remove domain from registrar
    function removeDomain(string memory _name) public {
        delete domains[_name];
    }
    
    // ******** Bidding functionality ********
    // Bid and reveal phase lengths, counted in block numbers
    uint constant bidLength = 3;
    uint constant revealLength = 3;
    
    // New Bidding info struct will be created for each new domain name bid initiated
    struct Bidding {
        
        // Mapping of sender address to corresponding bid commit hash
        mapping (address => bytes32) commits;
        
        // Expiry blocktime for bids to be added
        uint bidExpiry;
        
        // Expiry blocktime for bids to be revealed
        uint revealExpiry;
    }
    
    // Map domain name to Bidding info
    mapping (string => Bidding) public bids;
}
