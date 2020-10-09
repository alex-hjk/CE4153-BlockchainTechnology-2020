// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.8.0;

contract Registrar {
    struct Domain {
        address domainOwner;
        uint domainExpiry;      // domain expiry block number
    }

    // Create public mapping from owner address to domain
    mapping (string => Domain) public domains;

    // Commit domain to registrar after claimed bid
    function addDomain(string memory _name, address _owner, uint _expiry ) private {
        domains[_name].push(Domain(_owner, _expiry));
    }

    // Remove domain from registrar
    function removeDomain(string memory _name) private {
        delete domains[_name];
    }
}
