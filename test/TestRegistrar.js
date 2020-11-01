const Bidder = artifacts.require("Bidder");
const Registrar = artifacts.require("Registrar");
const BlockMiner = artifacts.require("BlockMiner");

const utils = require("./helpers/utils");

const expiryLengths = [5, 7, 9];
const bidValues = ["10000000000000000", "15000000000000000", "12000000000000000", "40000000000000000", "5000000000000000"];
const bidSalts = ["salt1", "salt2", "salt3"];
const domains = ["alex.ntu", "nicholas.ntu", "austine.ntu"];
const zeroAddress = "0x0000000000000000000000000000000000000000";

contract("TestRegistrarBidder", accounts => {
    let registrarInstance;
    let bidderInstance;
    let blockMinerInstance;

    beforeEach(async() => {
        registrarInstance = await Registrar.new({from: accounts[0]});
        bidderInstance = await Bidder.new(registrarInstance.address, {from: accounts[0]});
        blockMinerInstance = await BlockMiner.new({from: accounts[0]});
    });

    context("bidder utils", async() => {
        it("should be able to compute generated hash", async() => {
            const inputHash = web3.utils.soliditySha3({t: 'uint', v: bidValues[0]},{t: 'string', v: bidSalts[0]});
            const generatedHash = await bidderInstance.generateHash(bidValues[0], bidSalts[0]);
            assert.strictEqual(generatedHash, inputHash, "input and generated hash equal");
        });

        it("should be able to return block number", async() => {
            const currentBlockNumber = await web3.eth.getBlockNumber();
            const utilBlockNumber = await bidderInstance.currentBlock();
            assert.strictEqual(Number(utilBlockNumber), currentBlockNumber, "block number equal");
        });

        it("should be able to withdraw bidder balance to contract owner", async() => {
            const setBidder = await registrarInstance.setBidder(bidderInstance.address, {from: accounts[0]});
            assert.strictEqual(setBidder.receipt.status, true, "transaction success");

            const inputHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[0]},{t: 'string', v: bidSalts[0]});
            const newBid = await bidderInstance.startBid(domains[0], inputHash, {from: accounts[5]});
            assert.strictEqual(newBid.receipt.status, true, "transaction success");

            for(i = 0; i < 3; i++) {
                await blockMinerInstance.mine();
            };

            const revealBid = await bidderInstance.revealBid(domains[0], bidValues[0], bidSalts[0], {from: accounts[5]});
            assert.strictEqual(revealBid.receipt.status, true, "transaction success");

            for(i = 0; i < 3; i++) {
                await blockMinerInstance.mine();
            };

            const ownerBalanceBefore = BigInt(await web3.eth.getBalance(accounts[0]));
            const bidderBalanceBefore = BigInt(await web3.eth.getBalance(bidderInstance.address));

            const claimDomain = await bidderInstance.claimDomain(domains[0], {from: accounts[5], value: bidValues[0]});
            assert.strictEqual(claimDomain.receipt.status, true, "transaction success");

            const bidderBalanceAfter = BigInt(await web3.eth.getBalance(bidderInstance.address));
            assert.strictEqual(bidderBalanceAfter > BigInt(0), true, "bidder balance after >= 0");

            const bidderBalanceAdded = bidderBalanceAfter - bidderBalanceBefore;
            assert.strictEqual(bidderBalanceAdded == BigInt(bidValues[0]), true, "bidder balance added <= bid value");

            const withdraw = await bidderInstance.withdraw({from: accounts[0]});
            assert.strictEqual(withdraw.receipt.status, true, "transaction success");

            const ownerBalanceAfter = BigInt(await web3.eth.getBalance(accounts[0]));
            const ownerBalanceAdded = ownerBalanceAfter - ownerBalanceBefore;
            assert.strictEqual(ownerBalanceAdded > BigInt(0), true, "owner balance added >= 0");
            assert.strictEqual(ownerBalanceAdded < BigInt(bidValues[0]), true, "owner balance added <= bid value");
        });

        it("should not be able to withdraw bidder balance to non-contract owner", async() => {
            const setBidder = await registrarInstance.setBidder(bidderInstance.address, {from: accounts[0]});
            assert.strictEqual(setBidder.receipt.status, true, "transaction success");

            const inputHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[0]},{t: 'string', v: bidSalts[0]});
            const newBid = await bidderInstance.startBid(domains[0], inputHash, {from: accounts[6]});
            assert.strictEqual(newBid.receipt.status, true, "transaction success");

            for(i = 0; i < 3; i++) {
                await blockMinerInstance.mine();
            };

            const revealBid = await bidderInstance.revealBid(domains[0], bidValues[0], bidSalts[0], {from: accounts[6]});
            assert.strictEqual(revealBid.receipt.status, true, "transaction success");

            for(i = 0; i < 3; i++) {
                await blockMinerInstance.mine();
            };

            const claimDomain = await bidderInstance.claimDomain(domains[0], {from: accounts[6], value: bidValues[0]});
            assert.strictEqual(claimDomain.receipt.status, true, "transaction success");

            await utils.shouldThrow(bidderInstance.withdraw({from: accounts[1]}));
        });
    });

    context("registrar utils", async() => {
        it("should be able to return block number", async() => {
            const currentBlockNumber = await web3.eth.getBlockNumber();
            const utilBlockNumber = await registrarInstance.currentBlock();
            assert.strictEqual(Number(utilBlockNumber), currentBlockNumber, "block number equal");
        });
    });

    context("bidder parameters", async() => {
        it("should be able to set commit length", async() => {
            const commitLength = await bidderInstance.getCommitLength();
            assert.strictEqual(Number(commitLength), 3, "commit length equal");

            const result = await bidderInstance.setCommitLength(expiryLengths[0], {from: accounts[0]});
            assert.strictEqual(result.receipt.status, true, "transaction success");

            const newCommitLength = await bidderInstance.getCommitLength();
            assert.strictEqual(Number(newCommitLength), expiryLengths[0], "commit length equal");
        });

        it("should be able to set reveal length", async() => {
            const revealLength = await bidderInstance.getRevealLength();
            assert.strictEqual(Number(revealLength), 3, "reveal length equal");

            const result = await bidderInstance.setRevealLength(expiryLengths[1], {from: accounts[0]});
            assert.strictEqual(result.receipt.status, true, "transaction success");

            const newRevealLength = await bidderInstance.getRevealLength();
            assert.strictEqual(Number(newRevealLength), expiryLengths[1], "reveal length equal");
        });

        it("should be able to set claim length", async() => {
            const claimLength = await bidderInstance.getClaimLength();
            assert.strictEqual(Number(claimLength), 3, "commit length equal");

            const result = await bidderInstance.setClaimLength(expiryLengths[2], {from: accounts[0]});
            assert.strictEqual(result.receipt.status, true, "transaction success");

            const newClaimLength = await bidderInstance.getClaimLength();
            assert.strictEqual(Number(newClaimLength), expiryLengths[2], "commit length equal");
        });
    });

    context("registrar parameters", async() => {
        it("should be able to set bidder address by owner", async() => {
            const bidderAddress = await registrarInstance.getBidder();
            assert.strictEqual(bidderAddress, zeroAddress, "bidder address equal");

            const result = await registrarInstance.setBidder(bidderInstance.address, {from: accounts[0]});
            assert.strictEqual(result.receipt.status, true, "transaction success");

            const newBidderAddress = await registrarInstance.getBidder();
            assert.strictEqual(newBidderAddress, bidderInstance.address, "bidder address equal");

        });

        it("should not be able to set bidder address by non-owner", async() => {
            await utils.shouldThrow(registrarInstance.setBidder(bidderInstance.address, {from: accounts[1]}));
        });

        it("should be able to set default domain expiry by owner", async() => {
            const defaultExpiry = await registrarInstance.getDefaultDomainExpiry();
            assert.strictEqual(Number(defaultExpiry), 30, "expiry equal");

            const result = await registrarInstance.setDefaultDomainExpiry(50, {from: accounts[0]});
            assert.strictEqual(result.receipt.status, true, "transaction success");

            const newDefaultExpiry = await registrarInstance.getDefaultDomainExpiry();
            assert.strictEqual(Number(newDefaultExpiry), 50, "expiry equal");
        });

        it("should not be able to set default domain expiry by non-owner", async() => {
            await utils.shouldThrow(registrarInstance.setDefaultDomainExpiry(50, {from: accounts[1]}));
        });
    });

    context("start new bid", async() => {
        it("should be able to start new bid", async() => {
            const inputHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[0]},{t: 'string', v: bidSalts[0]});
            const newBid = await bidderInstance.startBid(domains[0], inputHash, {from: accounts[1]});
            assert.strictEqual(newBid.receipt.status, true, "transaction success");

            const commitHash = await bidderInstance.getBidCommitHash(domains[0],accounts[1]);
            assert.strictEqual(commitHash, inputHash, "hash equal");
            
            const blockNumber = await web3.eth.getBlockNumber();
            const commitBlock = await bidderInstance.getBidCommitBlockNumber(domains[0],accounts[1]);
            assert.strictEqual(Number(commitBlock), blockNumber, "block number equal");

            const bidActive = await bidderInstance.getBidIsActive(domains[0]);
            assert.strictEqual(bidActive, true, "bid active status equal");

            const bidCommitExpiry = await bidderInstance.getBidCommitExpiry(domains[0]);
            assert.strictEqual(Number(bidCommitExpiry), blockNumber+3, "bid commit expiry equal");

            const bidRevealExpiry = await bidderInstance.getBidRevealExpiry(domains[0]);
            assert.strictEqual(Number(bidRevealExpiry), blockNumber+6, "bid commit expiry equal");

            const bidClaimExpiry = await bidderInstance.getBidClaimExpiry(domains[0]);
            assert.strictEqual(Number(bidClaimExpiry), blockNumber+9, "bid commit expiry equal");

            const bidHighestBid = BigInt(await bidderInstance.getBidHighestBid(domains[0]));
            assert.strictEqual(bidHighestBid, BigInt(0), "bid highest bid equal");

            const bidHighestBidder = await bidderInstance.getBidHighestBidder(domains[0]);
            assert.strictEqual(bidHighestBidder, zeroAddress, "bid highest bidder equal");
        });

        it("should not be able to start new bid during commit phase", async() => {
            const inputHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[0]},{t: 'string', v: bidSalts[0]});
            const newBid = await bidderInstance.startBid(domains[0], inputHash, {from: accounts[1]});
            assert.strictEqual(newBid.receipt.status, true, "transaction success");

            for(i = 0; i < 2; i++) {
                await blockMinerInstance.mine();
            };

            await utils.shouldThrow(bidderInstance.startBid(domains[0], inputHash, {from: accounts[1]}));
        });

        it("should not be able to start new bid during reveal phase", async() => {
            const inputHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[0]},{t: 'string', v: bidSalts[0]});
            const newBid = await bidderInstance.startBid(domains[0], inputHash, {from: accounts[2]});
            assert.strictEqual(newBid.receipt.status, true, "transaction success");

            for(i = 0; i < 5; i++) {
                await blockMinerInstance.mine();
            };

            await utils.shouldThrow(bidderInstance.startBid(domains[0], inputHash, {from: accounts[2]}));
        });

        it("should not be able to start new bid during claim phase", async() => {
            const inputHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[0]},{t: 'string', v: bidSalts[0]});
            const newBid = await bidderInstance.startBid(domains[0], inputHash, {from: accounts[3]});
            assert.strictEqual(newBid.receipt.status, true, "transaction success");

            for(i = 0; i < 8; i++) {
                await blockMinerInstance.mine();
            };

            await utils.shouldThrow(bidderInstance.startBid(domains[0], inputHash, {from: accounts[3]}));
        });

        it("should be able to start new bid after claim phase and domain unclaimed", async() => {
            const inputHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[0]},{t: 'string', v: bidSalts[0]});
            const newBid = await bidderInstance.startBid(domains[0], inputHash, {from: accounts[4]});
            assert.strictEqual(newBid.receipt.status, true, "transaction success");

            for(i = 0; i < 9; i++) {
                await blockMinerInstance.mine();
            };

            const anotherBid = await bidderInstance.startBid(domains[0], inputHash, {from: accounts[4]});
            assert.strictEqual(anotherBid.receipt.status, true, "transaction success");
        });

        it("should not be able to start new bid after claim phase and domain claimed", async() => {
            const setBidder = await registrarInstance.setBidder(bidderInstance.address, {from: accounts[0]});
            assert.strictEqual(setBidder.receipt.status, true, "transaction success");

            const inputHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[0]},{t: 'string', v: bidSalts[0]});
            const newBid = await bidderInstance.startBid(domains[0], inputHash, {from: accounts[5]});
            assert.strictEqual(newBid.receipt.status, true, "transaction success");

            for(i = 0; i < 3; i++) {
                await blockMinerInstance.mine();
            };

            const revealBid = await bidderInstance.revealBid(domains[0], bidValues[0], bidSalts[0], {from: accounts[5]});
            assert.strictEqual(revealBid.receipt.status, true, "transaction success");

            for(i = 0; i < 3; i++) {
                await blockMinerInstance.mine();
            };

            const claimDomain = await bidderInstance.claimDomain(domains[0], {from: accounts[5], value: bidValues[0]});
            assert.strictEqual(claimDomain.receipt.status, true, "transaction success");

            for(i = 0; i < 5; i++) {
                await blockMinerInstance.mine();
            };

            const nextHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[1]},{t: 'string', v: bidSalts[1]});
            await utils.shouldThrow(bidderInstance.startBid(domains[0], nextHash, {from: accounts[6]}));
        });

        it("should be able to start new bid after domain expired", async() => {
            const setBidder = await registrarInstance.setBidder(bidderInstance.address, {from: accounts[0]});
            assert.strictEqual(setBidder.receipt.status, true, "transaction success");

            const inputHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[0]},{t: 'string', v: bidSalts[0]});
            const newBid = await bidderInstance.startBid(domains[0], inputHash, {from: accounts[7]});
            assert.strictEqual(newBid.receipt.status, true, "transaction success");

            for(i = 0; i < 3; i++) {
                await blockMinerInstance.mine();
            };

            const revealBid = await bidderInstance.revealBid(domains[0], bidValues[0], bidSalts[0], {from: accounts[7]});
            assert.strictEqual(revealBid.receipt.status, true, "transaction success");

            for(i = 0; i < 3; i++) {
                await blockMinerInstance.mine();
            };

            const claimDomain = await bidderInstance.claimDomain(domains[0], {from: accounts[7], value: bidValues[0]});
            assert.strictEqual(claimDomain.receipt.status, true, "transaction success");

            for(i = 0; i < 30; i++) {
                await blockMinerInstance.mine();
            };

            const nextHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[1]},{t: 'string', v: bidSalts[1]});
            const nextBid = await bidderInstance.startBid(domains[0], nextHash, {from: accounts[8]});
            assert.strictEqual(nextBid.receipt.status, true, "transaction success");
        });
    });

    context("add bid", async() => {
        it("should be able to add bid during commit phase", async() => {
            const inputHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[0]},{t: 'string', v: bidSalts[0]});
            const newBid = await bidderInstance.startBid(domains[0], inputHash, {from: accounts[5]});
            assert.strictEqual(newBid.receipt.status, true, "transaction success");

            for(i = 0; i < 2; i++) {
                await blockMinerInstance.mine();
            };

            const nextHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[1]},{t: 'string', v: bidSalts[1]});
            const nextBid = await bidderInstance.addBid(domains[0], nextHash, {from: accounts[6]});
            assert.strictEqual(nextBid.receipt.status, true, "transaction success");
        });

        it("should not be able to add bid without new bid started", async() => {
            const nextHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[0]},{t: 'string', v: bidSalts[0]});
            await utils.shouldThrow(bidderInstance.addBid(domains[0], nextHash, {from: accounts[7]}));
        });

        it("should not be able to add bid during reveal phase", async() => {
            const inputHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[0]},{t: 'string', v: bidSalts[0]});
            const newBid = await bidderInstance.startBid(domains[0], inputHash, {from: accounts[8]});
            assert.strictEqual(newBid.receipt.status, true, "transaction success");

            for(i = 0; i < 5; i++) {
                await blockMinerInstance.mine();
            };

            const nextHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[1]},{t: 'string', v: bidSalts[1]});
            await utils.shouldThrow(bidderInstance.addBid(domains[0], nextHash, {from: accounts[9]}));
        });

        it("should not be able to add bid during claim phase", async() => {
            const inputHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[0]},{t: 'string', v: bidSalts[0]});
            const newBid = await bidderInstance.startBid(domains[0], inputHash, {from: accounts[1]});
            assert.strictEqual(newBid.receipt.status, true, "transaction success");

            for(i = 0; i < 8; i++) {
                await blockMinerInstance.mine();
            };

            const nextHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[1]},{t: 'string', v: bidSalts[1]});
            await utils.shouldThrow(bidderInstance.addBid(domains[0], nextHash, {from: accounts[2]}));
        });
    });

    context("reveal bid", async() => {
        it("should be able to reveal bid during reveal phase", async() => {
            const inputHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[0]},{t: 'string', v: bidSalts[0]});
            const newBid = await bidderInstance.startBid(domains[0], inputHash, {from: accounts[3]});
            assert.strictEqual(newBid.receipt.status, true, "transaction success");

            const nextHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[1]},{t: 'string', v: bidSalts[1]});
            const nextBid = await bidderInstance.addBid(domains[0], nextHash, {from: accounts[4]});
            assert.strictEqual(nextBid.receipt.status, true, "transaction success");

            for(i = 0; i < 2; i++) {
                await blockMinerInstance.mine();
            };

            let revealBid;
            let highestBid;
            let highestBidder;

            revealBid = await bidderInstance.revealBid(domains[0], bidValues[0], bidSalts[0], {from: accounts[3]});
            assert.strictEqual(revealBid.receipt.status, true, "transaction success");

            highestBid = BigInt(await bidderInstance.getBidHighestBid(domains[0]));
            assert.strictEqual(highestBid, BigInt(bidValues[0]), "bid highest bid equal");

            highestBidder = await bidderInstance.getBidHighestBidder(domains[0]);
            assert.strictEqual(highestBidder, accounts[3], "bid highest bidder equal");

            revealBid = await bidderInstance.revealBid(domains[0], bidValues[1], bidSalts[1], {from: accounts[4]});
            assert.strictEqual(revealBid.receipt.status, true, "transaction success");

            highestBid = BigInt(await bidderInstance.getBidHighestBid(domains[0]));
            assert.strictEqual(highestBid, BigInt(bidValues[1]), "bid highest bid equal");

            highestBidder = await bidderInstance.getBidHighestBidder(domains[0]);
            assert.strictEqual(highestBidder, accounts[4], "bid highest bidder equal");
        });

        it("should let earlier bidder be winner in event of same highest bids", async() => {
            const inputHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[0]},{t: 'string', v: bidSalts[0]});
            const newBid = await bidderInstance.startBid(domains[0], inputHash, {from: accounts[5]});
            assert.strictEqual(newBid.receipt.status, true, "transaction success");

            const nextHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[0]},{t: 'string', v: bidSalts[1]});
            const nextBid = await bidderInstance.addBid(domains[0], nextHash, {from: accounts[6]});
            assert.strictEqual(nextBid.receipt.status, true, "transaction success");

            for(i = 0; i < 2; i++) {
                await blockMinerInstance.mine();
            };

            revealBid = await bidderInstance.revealBid(domains[0], bidValues[0], bidSalts[1], {from: accounts[6]});
            assert.strictEqual(revealBid.receipt.status, true, "transaction success");

            highestBid = BigInt(await bidderInstance.getBidHighestBid(domains[0]));
            assert.strictEqual(highestBid, BigInt(bidValues[0]), "bid highest bid equal");

            highestBidder = await bidderInstance.getBidHighestBidder(domains[0]);
            assert.strictEqual(highestBidder, accounts[6], "bid highest bidder equal");

            revealBid = await bidderInstance.revealBid(domains[0], bidValues[0], bidSalts[0], {from: accounts[5]});
            assert.strictEqual(revealBid.receipt.status, true, "transaction success");

            highestBid = BigInt(await bidderInstance.getBidHighestBid(domains[0]));
            assert.strictEqual(highestBid, BigInt(bidValues[0]), "bid highest bid equal");

            highestBidder = await bidderInstance.getBidHighestBidder(domains[0]);
            assert.strictEqual(highestBidder, accounts[5], "bid highest bidder equal");
        });

        it("should not be able to reveal bid during commit phase", async() => {
            const inputHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[0]},{t: 'string', v: bidSalts[0]});
            const newBid = await bidderInstance.startBid(domains[0], inputHash, {from: accounts[7]});
            assert.strictEqual(newBid.receipt.status, true, "transaction success");

            await utils.shouldThrow(bidderInstance.revealBid(domains[0], bidValues[0], bidSalts[0], {from: accounts[7]}));
        });

        it("should not be able to reveal bid during claim phase", async() => {
            const inputHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[0]},{t: 'string', v: bidSalts[0]});
            const newBid = await bidderInstance.startBid(domains[0], inputHash, {from: accounts[8]});
            assert.strictEqual(newBid.receipt.status, true, "transaction success");

            for(i = 0; i < 6; i++) {
                await blockMinerInstance.mine();
            };

            await utils.shouldThrow(bidderInstance.revealBid(domains[0], bidValues[0], bidSalts[0], {from: accounts[8]}));
        });
    });

    context("claim domain", async() => {
        it("should be able to claim domain during claim phase", async() => {
            const setBidder = await registrarInstance.setBidder(bidderInstance.address, {from: accounts[0]});
            assert.strictEqual(setBidder.receipt.status, true, "transaction success");

            const inputHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[0]},{t: 'string', v: bidSalts[0]});
            const newBid = await bidderInstance.startBid(domains[0], inputHash, {from: accounts[9]});
            assert.strictEqual(newBid.receipt.status, true, "transaction success");

            for(i = 0; i < 3; i++) {
                await blockMinerInstance.mine();
            };

            const revealBid = await bidderInstance.revealBid(domains[0], bidValues[0], bidSalts[0], {from: accounts[9]});
            assert.strictEqual(revealBid.receipt.status, true, "transaction success");

            for(i = 0; i < 3; i++) {
                await blockMinerInstance.mine();
            };

            const accountBalanceBefore = BigInt(await web3.eth.getBalance(accounts[9]));
            const bidderBalanceBefore = BigInt(await web3.eth.getBalance(bidderInstance.address));

            const claimDomain = await bidderInstance.claimDomain(domains[0], {from: accounts[9], value: bidValues[0]});
            assert.strictEqual(claimDomain.receipt.status, true, "transaction success");

            const accountBalanceAfter = BigInt(await web3.eth.getBalance(accounts[9]));
            const bidderBalanceAfter = BigInt(await web3.eth.getBalance(bidderInstance.address));
            assert.strictEqual(accountBalanceAfter <= accountBalanceBefore, true, "account balance after <= account balance before");
            assert.strictEqual(bidderBalanceAfter >= BigInt(0), true, "bidder balance after >=0");

            const accountBalanceUsed = accountBalanceBefore - accountBalanceAfter;
            const bidderBalanceAdded = bidderBalanceAfter - bidderBalanceBefore;
            assert.strictEqual(accountBalanceUsed >= BigInt(bidValues[0]), true, "account balance used >= bid value");
            assert.strictEqual(bidderBalanceAdded <= BigInt(bidValues[0]), true, "bidder balance added <= bid value");

            const domainOwner = await registrarInstance.getOwner(domains[0]);
            assert.strictEqual(domainOwner, accounts[9], "domain owner equal");

            const domainExpiry = await registrarInstance.getExpiry(domains[0]);
            const currentBlock = await registrarInstance.currentBlock();
            assert.strictEqual(Number(domainExpiry), Number(currentBlock)+30, "domain expiry equal");
        });

        it("should be able to claim domain during claim phase and recieve excess fee", async() => {
            const setBidder = await registrarInstance.setBidder(bidderInstance.address, {from: accounts[0]});
            assert.strictEqual(setBidder.receipt.status, true, "transaction success");

            const inputHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[0]},{t: 'string', v: bidSalts[0]});
            const newBid = await bidderInstance.startBid(domains[0], inputHash, {from: accounts[1]});
            assert.strictEqual(newBid.receipt.status, true, "transaction success");

            for(i = 0; i < 3; i++) {
                await blockMinerInstance.mine();
            };

            const revealBid = await bidderInstance.revealBid(domains[0], bidValues[0], bidSalts[0], {from: accounts[1]});
            assert.strictEqual(revealBid.receipt.status, true, "transaction success");

            for(i = 0; i < 3; i++) {
                await blockMinerInstance.mine();
            };

            const accountBalanceBefore = BigInt(await web3.eth.getBalance(accounts[1]));
            const bidderBalanceBefore = BigInt(await web3.eth.getBalance(bidderInstance.address));

            const claimDomain = await bidderInstance.claimDomain(domains[0], {from: accounts[1], value: bidValues[3]});
            assert.strictEqual(claimDomain.receipt.status, true, "transaction success");

            const accountBalanceAfter = BigInt(await web3.eth.getBalance(accounts[1]));
            const bidderBalanceAfter = BigInt(await web3.eth.getBalance(bidderInstance.address));
            assert.strictEqual(accountBalanceAfter <= accountBalanceBefore, true, "account balance after <= account balance before");
            assert.strictEqual(bidderBalanceAfter >= BigInt(0), true, "bidder balance after >=0");

            const bidderBalanceAdded = bidderBalanceAfter - bidderBalanceBefore;
            assert.strictEqual(bidderBalanceAdded <= BigInt((Number(bidValues[3]) - Number(bidValues[0]))), true, "bidder balance added <= bid value");
        });

        it("should be not able to claim domain if post-gas value sent is less than highest bid", async() => {
            const setBidder = await registrarInstance.setBidder(bidderInstance.address, {from: accounts[0]});
            assert.strictEqual(setBidder.receipt.status, true, "transaction success");

            const inputHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[0]},{t: 'string', v: bidSalts[0]});
            const newBid = await bidderInstance.startBid(domains[0], inputHash, {from: accounts[2]});
            assert.strictEqual(newBid.receipt.status, true, "transaction success");

            for(i = 0; i < 3; i++) {
                await blockMinerInstance.mine();
            };

            const revealBid = await bidderInstance.revealBid(domains[0], bidValues[0], bidSalts[0], {from: accounts[2]});
            assert.strictEqual(revealBid.receipt.status, true, "transaction success");

            for(i = 0; i < 3; i++) {
                await blockMinerInstance.mine();
            };

            await utils.shouldThrow(bidderInstance.claimDomain(domains[0], {from: accounts[2], value: bidValues[4]}));
        });

        it("should not be able to claim domain during commit phase", async() => {
            const inputHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[0]},{t: 'string', v: bidSalts[0]});
            const newBid = await bidderInstance.startBid(domains[0], inputHash, {from: accounts[3]});
            assert.strictEqual(newBid.receipt.status, true, "transaction success");

            await utils.shouldThrow(bidderInstance.claimDomain(domains[0], {from: accounts[3], value: bidValues[0]}));
        });

        it("should not be able to claim domain during reveal phase", async() => {
            const inputHash = await web3.utils.soliditySha3({t: 'uint', v: bidValues[0]},{t: 'string', v: bidSalts[0]});
            const newBid = await bidderInstance.startBid(domains[0], inputHash, {from: accounts[4]});
            assert.strictEqual(newBid.receipt.status, true, "transaction success");

            for(i = 0; i < 3; i++) {
                await blockMinerInstance.mine();
            };

            await utils.shouldThrow(bidderInstance.claimDomain(domains[0], {from: accounts[4], value: bidValues[0]}));
        });
    });
})