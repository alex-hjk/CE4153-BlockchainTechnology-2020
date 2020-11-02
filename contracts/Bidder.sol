// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.8.0;

import "./Ownable.sol";
import "./Registrar.sol";

contract Bidder is Ownable {
    Registrar reg;
    
    // Pass the address of Registrar contract during construction
    constructor(Registrar addr) {
        reg = addr;
    }
    
    // ******** Bidding functionality ********

    // Bid, reveal, claim phase lengths, counted in block numbers
    uint commitLength = 3;
    uint revealLength = 3;
    uint claimLength = 3;

    // Setter functions for Bid, Reveal & Claim phase lengths, modifiable only by Owner
    function setCommitLength(uint _commitLength) external onlyOwner {
        commitLength = _commitLength;
    }

    function setRevealLength(uint _revealLength) external onlyOwner {
        revealLength = _revealLength;
    }

    function setClaimLength(uint _claimLength) external onlyOwner {
        claimLength = _claimLength;
    }

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

    // ******** Events ********

    event StartBid(
        string domainName,
        address bidder
    );

    event ClaimDomain(
        string domainName,
        address owner
    );

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
        Bidding storage b = bids[_name];

        // Only proceed if empty or expired domain
        uint ex = reg.getExpiry(_name);
        if (ex != 0) {
            require(block.number >= ex);
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

        // Emit event
        emit StartBid(_name, msg.sender);
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
        bytes32 commitCalc = keccak256(abi.encodePacked(_value, _salt));

        // Require calculated hash to match previously committed hash within same bidding cycle
        require(b.commits[msg.sender].commitHash == commitCalc);
        require(b.commits[msg.sender].commitBlock <= b.commitExpiry);

        // Check if bid value is highest bid and set if true, with equal bid tiebreaker based on earlier commit and equal commit tiebreaker based on earlier reveal tx
        if (b.highestBid < _value) {
            b.highestBid = _value;
            b.highestBidder = msg.sender;
        } else if (b.highestBid == _value) {
            if (b.commits[msg.sender].commitBlock < b.commits[b.highestBidder].commitBlock) {
                b.highestBidder = msg.sender;
            }
        }
    }

    // ******** Claim phase ********

    function claimDomain(string memory _name, address _target) external biddingActive(_name) claimPhase(_name) payable {
        Bidding storage b = bids[_name];

        // Only allow highest bidder to claim domain
        require(b.highestBidder == msg.sender);

        // Check to make sure value sent >= highestBid
        require(msg.value >= b.highestBid);

        // Set bidding to inactive after claim, state change before external function
        b.active = false;

        // Store domain registration info in registrar for target resolution address
        reg.addDomain(_name, _target);

        // Refund excess fee back to msg.sender if necessary
        if (msg.value - b.highestBid > 0) {
            msg.sender.transfer(msg.value - b.highestBid);
        }


        // Emit event
        emit ClaimDomain(_name, msg.sender);
    }

    // ******** Withdraw functionality ********

    function withdraw() external onlyOwner{
        msg.sender.transfer(address(this).balance);
    }
    
    // ******** Helper functions ********

    // Generates hashed commit, can be called for free externally
    function generateHash(uint _value, string memory _salt) public pure returns(bytes32) {
        return keccak256(abi.encodePacked(_value, _salt));
    }

    // Returns current commit length, in blocks
    function getCommitLength() public view returns(uint) {
        return commitLength;
    }
    
    // Returns current reveal length, in blocks
    function getRevealLength() public view returns(uint) {
        return revealLength;
    }
    
    // Returns current claim length, in blocks
    function getClaimLength() public view returns(uint) {
        return claimLength;
    }

    // Returns bidding information
    function getBiddingInfo(string memory _name) public view returns(uint commitExp, uint revealExp, uint claimExp, uint highBid, address highBidder, bool active) {
        commitExp = bids[_name].commitExpiry;
        revealExp = bids[_name].revealExpiry;
        claimExp = bids[_name].claimExpiry;
        highBid = bids[_name].highestBid;
        highBidder = bids[_name].highestBidder;
        active = bids[_name].active;
    }
    
    // Check whether correct phase to proceed with new bid
    function canStart(string memory _name) public view returns(bool) {
        if (bids[_name].active) {
            return (block.number > bids[_name].claimExpiry);
        } else return true;
    }

    // Check whether correct phase to proceed with adding bid
    function canAdd(string memory _name) public view returns(bool) {
        return (bids[_name].active
        && block.number <= bids[_name].commitExpiry);
    }

    // Check whether correct phase to proceed with revealing bid
    function canReveal(string memory _name) public view returns(bool) {
        return (bids[_name].active
        && block.number > bids[_name].commitExpiry
        && block.number <= bids[_name].revealExpiry);
    }

    // Check whether correct phase to proceed with claiming domain
    function canClaim(string memory _name) public view returns(bool) {
        return (bids[_name].active
        && block.number > bids[_name].revealExpiry
        && block.number <= bids[_name].claimExpiry);
    }

    // Returns current block number
    function currentBlock() public view returns(uint) {
        return block.number;
    }
}