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
}
