// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.8.0;

contract BlockMiner {
    uint private blocksMined;

    constructor() {
        blocksMined = 0;
    }

    function mine() public {
       blocksMined += 1;
    }
}