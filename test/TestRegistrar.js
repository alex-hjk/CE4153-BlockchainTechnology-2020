const Web3 = require("web3");
let web3 = new Web3('ws://localhost:8546');

const Bidder  = artifacts.require("Bidder");
const domainNames = ["test1", "test2", "test3"];
const salts = ["abc", "def", "hij"];
const bids = [10, 12, 14];

function solSha3 (...args) {
    args = args.map(arg => {
        if (typeof arg === 'string') {
            if (arg.substring(0, 2) === '0x') {
                return arg.slice(2)
            } else {
                return web3.toHex(arg).slice(2)
            }
        }

        if (typeof arg === 'number') {
            return leftPad((arg).toString(16), 64, 0)
        } else {
          return ''
        }
    })

    args = args.join('')

    return '0x' + web3.sha3(args, { encoding: 'hex' })
}

contract("Bidder", (accounts) => {
    let [alice, bob, charlie] = accounts;

    it("should be able to start a new domain name bid", async () => {
        
        const contractInstance = await Bidder.new();
        const result = await contractInstance.startBid(domainNames[0], solSha3(salts[0], bids[0]), {from: alice});
        
    })
})