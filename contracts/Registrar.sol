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
    uint constant commitLength = 3;
    uint constant revealLength = 3;
    
    // New Bidding info struct will be created for each new domain name bid initiated
    struct Bidding {

        // Mapping of sender address to corresponding bid commit hash
        mapping (address => bytes32) commits;
        
        // Expiry blocktime for bids to be added
        uint commitExpiry;
        
        // Expiry blocktime for bids to be revealed
        uint revealExpiry;

        bool active;
    }
    
    // Map domain name to Bidding info
    mapping (string => Bidding) public bids;

    // ******** Commit phase ********

    // Check for inactive bid
    modifier biddingInactive(string memory _name) {
        require(!bids[_name].active);
        _;
    }
    
    // Check for active bid
    modifier biddingActive(string memory _name) {
        require(bids[_name].active);
        _;
    }
    
    // Check for block height < commit expiry
    modifier commitPhase(string memory _name) {
        require(block.number <= bids[_name].commitExpiry);
        _;
    }
    
    // Check for commit expiry < block height < reveal expiry
    modifier revealPhase(string memory _name) {
        require(block.number > bids[_name].commitExpiry);
        require(block.number <= bids[_name].revealExpiry);
        _;
    }
    
    // Start a new domain name bid
    function startBid(string memory _name, bytes32 _commit) public biddingInactive(_name) {
        Bidding storage b = bids[_name];
        
        // Set bid and reveal expiry times
        b.commitExpiry = block.number + commitLength;
        b.revealExpiry = block.number + commitLength + revealLength;
        
        // Assign hashed commit to address in bid info mapping
        b.commits[msg.sender] = _commit;
        
        // Set bid to active
        b.active = true;
    }
    
    // Add to an active bid
    function addBid(string memory _name, bytes32 _commit) public biddingActive(_name) commitPhase(_name) {
        Bidding storage b = bids[_name];
        
        // Assign hashed commit to address in bid info mapping
        b.commits[msg.sender] = _commit;
    }
}
