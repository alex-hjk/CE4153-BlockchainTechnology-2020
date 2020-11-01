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

    // Gets bidder contract address
    function getBidder() public view returns(address) {
        return _bidder;
    }
    
    modifier onlyBidder() {
        require(msg.sender == _bidder);
        _;
    }
    
    // ******** Domain storage ********
    // uint defaultDomainExpiry = 2427456;    // 1 year / 13 seconds (estimated block time)
    uint defaultDomainExpiry = 30;

    // Setter function for domainExpiry length, modifiable only by Owner
    function setDefaultDomainExpiry(uint _domainExpiry) external onlyOwner {
        defaultDomainExpiry = _domainExpiry;
    }

    // Get default domain expiry
    function getDefaultDomainExpiry() public view returns(uint) {
        return defaultDomainExpiry;
    }

    struct Domain {
        address domainOwner;
        uint domainExpiry;      // domain expiry block number
    }

    // Create mapping from domain name string to domain info struct
    mapping (string => Domain) public domains;

    // Commit domain to registrar after claimed bid
    function addDomain(string memory _name, address _owner) external onlyBidder {
        Domain storage d = domains[_name];
        d.domainOwner = _owner;
        d.domainExpiry = block.number + defaultDomainExpiry;
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
    function getExpiry(string memory _domainName) public view returns(uint) {
        return domains[_domainName].domainExpiry;
    }

    // Get domain owner
    function getOwner(string memory _domainName) public view returns(address) {
        return domains[_domainName].domainOwner;
    }
    
    // Lookup specific domain's owner and expiry
    function getSpecificDomainDetails(string memory _domainName) public view returns(address domainOwner, uint domainExpiry) {
        return (domains[_domainName].domainOwner, domains[_domainName].domainExpiry);
    }
}