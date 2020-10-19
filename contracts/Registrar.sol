// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.8.0;

contract Registrar {
    // ******** Domain storage ********
    uint constant domainExpiry = 2427456;    // 1 year / 13 seconds (estimated block time)
    
    struct Domain {
        address domainOwner;
        uint domainExpiry;      // domain expiry block number
    }

    // Create mapping from domain name string to domain info struct
    mapping (string => Domain) public domains;

    // Commit domain to registrar after claimed bid
    function addDomain(string memory _name, address _owner) public {
        Domain storage d = domains[_name];
        d.domainOwner = _owner;
        d.domainExpiry = block.number + domainExpiry;
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
        
        // Check if bidding is active
        bool active;
        
        // Store highest bid during reveal phase
        uint highestBid;
        
        // Store address of highest bidder during reveal phase
        address highestBidder;
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
    
    // Check for block height > reveal expiry > commit expiry
    modifier claimPhase(string memory _name) {
        require(block.number > bids[_name].commitExpiry);
        require(block.number > bids[_name].revealExpiry);
        _;
    }
    
    // Start a new domain name bid
    function startBid(string memory _name, bytes32 _commit) public biddingInactive(_name) {
        Domain memory d = domains[_name];
        Bidding storage b = bids[_name];
        
        // Only proceed if empty or expired domain
        if (d.domainExpiry != 0) {
            require(block.number > d.domainExpiry);
        }
        
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
    
    // ******** Reveal phase ********
    
    function revealBid(string memory _name, uint _value, string memory _salt) public biddingActive(_name) revealPhase(_name) {
        
        // Compute commit hash based on bid value and salt
        bytes32 commitCalc = generateHash(_value, _salt);
        
        // Require calculated hash to match previously committed hash
        require(bids[_name].commits[msg.sender] == commitCalc);
        
        // Check if bid value is highest bid and set if true
        Bidding storage b = bids[_name];
        if (b.highestBid < _value) {
            b.highestBid = _value;
            b.highestBidder = msg.sender;
        }
    }
    
    // ******** Claim phase ********
    
    function claimDomain(string memory _name) public biddingActive(_name) claimPhase(_name) {
        
        // Only allow highest bidder to claim domain
        require(bids[_name].highestBidder == msg.sender);
        
        // Store domain registration info in registrar
        addDomain(_name, msg.sender);

        // Set bidding to inactive after claim
        Bidding storage b = bids[_name];
        b.active = false;
    }
    
    // ******** Helper functions ********
    
    // Generates hashed commit, can be called for free externally
    function generateHash(uint _value, string memory _salt) public pure returns(bytes32) {
        return keccak256(abi.encode(_value, _salt));
    }
    
    // Returns current block number
    function currentBlock() public view returns(uint) {
        return block.number;
    }
}