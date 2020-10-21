// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.8.0;

import "./Ownable.sol";

contract Registrar is Ownable{
    // ******** Domain storage ********
    uint constant domainExpiry = 2427456;    // 1 year / 13 seconds (estimated block time)

    struct Domain {
        address domainOwner;
        uint domainExpiry;      // domain expiry block number
    }

    // Create mapping from domain name string to domain info struct
    mapping (string => Domain) public domains;

    // Commit domain to registrar after claimed bid
    function addDomain(string memory _name, address _owner) private {
        Domain storage d = domains[_name];
        d.domainOwner = _owner;
        d.domainExpiry = block.number + domainExpiry;
    }

    // Remove domain from registrar
    function removeDomain(string memory _name) public {
        delete domains[_name];
    }

    // ******** Bidding functionality ********

    // Bid, reveal, claim phase lengths, counted in block numbers
    uint constant commitLength = 3;
    uint constant revealLength = 3;
    uint constant claimLength = 3;

    // New Bidding info struct will be created for each new domain name bid initiated
    struct Bidding {

        // Map sender address to corresponding commit info
        mapping (address => Commit) commits;

        // Expiry blocktime for bids to be added
        uint commitExpiry;

        // Expiry blocktime for bids to be revealed
        uint revealExpiry;

        // Expiry blocktime for domain of bid to be claimed
        uint claimExpiry;

        // Store highest bid during reveal phase, in Wei
        uint highestBid;

        // Store address of highest bidder during reveal phase
        address highestBidder;

        // Check if bidding is active
        bool active;
    }

    struct Commit {

        // Store commit hash and block number
        bytes32 commitHash;
        uint commitBlock;
    }

    // Map domain name to Bidding info
    mapping (string => Bidding) public bids;

    // ******** Commit phase ********

    // Check for inactive bidding cycle
    modifier biddingInactive(string memory _name) {
        if (bids[_name].active) {
            require(block.number > bids[_name].claimExpiry);
        }
        _;
    }

    // Check for active bidding cycle
    modifier biddingActive(string memory _name) {
        require(bids[_name].active);
        require(block.number <= bids[_name].claimExpiry);
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
        require(block.number > bids[_name].revealExpiry);
        require(block.number <= bids[_name].claimExpiry);
        _;
    }

    // Start a new domain name bid
    function startBid(string memory _name, bytes32 _commit) external biddingInactive(_name) {
        Domain memory d = domains[_name];
        Bidding storage b = bids[_name];

        // Only proceed if empty or expired domain
        if (d.domainExpiry != 0) {
            require(block.number > d.domainExpiry);
        }

        // Reset bidding info - important for clearing highest bidder
        delete bids[_name];

        // Set bid and reveal expiry times
        b.commitExpiry = block.number + commitLength;
        b.revealExpiry = block.number + commitLength + revealLength;
        b.claimExpiry = block.number + commitLength + revealLength + claimLength;

        // Assign hashed commit to address in bid info mapping and store block number
        b.commits[msg.sender].commitHash = _commit;
        b.commits[msg.sender].commitBlock = block.number;

        // Set bid to active
        b.active = true;
    }

    // Add to an active bid
    function addBid(string memory _name, bytes32 _commit) external biddingActive(_name) commitPhase(_name) {
        Bidding storage b = bids[_name];

        // Assign hashed commit to address in bid info mapping and store block number
        b.commits[msg.sender].commitHash = _commit;
        b.commits[msg.sender].commitBlock = block.number;
    }

    // ******** Reveal phase ********

    function revealBid(string memory _name, uint _value, string memory _salt) external biddingActive(_name) revealPhase(_name) {
        Bidding storage b = bids[_name];

        // Compute commit hash based on bid value and salt
        bytes32 commitCalc = generateHash(_value, _salt);

        // Require calculated hash to match previously committed hash within same bidding cycle
        require(b.commits[msg.sender].commitHash == commitCalc);
        require(b.commits[msg.sender].commitBlock <= b.commitExpiry);

        // Check if bid value is highest bid and set if true
        if (b.highestBid < _value) {
            b.highestBid = _value;
            b.highestBidder = msg.sender;
        }
    }

    // ******** Claim phase ********

    function claimDomain(string memory _name) external biddingActive(_name) claimPhase(_name) payable{
        Bidding storage b = bids[_name];

        // Only allow highest bidder to claim domain
        require(b.highestBidder == msg.sender);

        // Check to make sure value sent >= highestBid
        require(msg.value >= b.highestBid);

        // Set bidding to inactive after claim, state change before external function
        b.active = false;

        // Store domain registration info in registrar
        addDomain(_name, msg.sender);

        // Refund excess fee back to msg.sender
        msg.sender.transfer(msg.value - b.highestBid);
    }

    // ******** Withdraw functionality ********

    function withdraw() external onlyOwner{
        address payable _owner = address(uint160(owner()));
        _owner.transfer(address(this).balance);
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