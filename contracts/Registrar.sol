// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.8.0;

import "./Ownable.sol";

contract Registrar is Ownable {
    
    // ******** Bidder contract reference setup ********
    address private _bidder;
    
    // Only owner can set bidder contract address
    function setBidder(address _bidderAddress) external onlyOwner {
        _bidder = _bidderAddress;
    }
    
    modifier onlyBidder() {
        require(msg.sender == _bidder);
        _;
    }
    
    // ******** Events ********

    // Indexed parameters can be used for reverse lookup by filtering through historical events
    event AddDomain(
        string domainName,
        address indexed owner,
        uint expiry
    );

    // ******** Domain storage ********
    uint defaultDomainExpiry = 2427456;    // 1 year / 13 seconds (estimated block time)

    // Setter function for domainExpiry length, modifiable only by Owner
    function setDefaultDomainExpiry(uint _domainExpiry) external onlyOwner {
        defaultDomainExpiry = _domainExpiry;
    }

    struct Domain {
        address domainOwner;
        uint domainExpiry;      // domain expiry block number
    }

    // Create mapping from domain name string to domain info struct
    mapping (string => Domain) public domains;


    // Commit domain to registrar after claimed bid
    function addDomain(string memory _name, address _target) external onlyBidder {
        Domain storage d = domains[_name];
        d.domainOwner = _target;
        d.domainExpiry = block.number + defaultDomainExpiry;

        // Emit event to log domain name and owner address
        emit AddDomain(_name, _target, d.domainExpiry);
    }

    // Remove domain from registrar
    function removeDomain(string memory _name) external {
        require(isOwner() || msg.sender == _bidder);        // only owner or bidder contract can delete domains
        delete domains[_name];
    }
    
    // ******** Helper functions ********

    // Returns current block number
    function currentBlock() public view returns(uint) {
        return block.number;
    }
    
    // Gets domain expiry
    function getExpiry(string memory _name) public view returns(uint) {
        return domains[_name].domainExpiry;
    }
    
    // Gets domain owner - name resolution service
    function getOwner(string memory _name) public view returns(address) {
        return domains[_name].domainOwner;
    }

    // Lookup specific domain's owner and expiry
    function getSpecificDomainDetails(string memory _domainName) public view returns(address domainOwner, uint domainExpiry) {
        return (domains[_domainName].domainOwner, domains[_domainName].domainExpiry);
    }
}