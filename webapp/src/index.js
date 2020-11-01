const app = require("./app");

const auctionStage = {
  BID: "bid",
  REVEAL: "reveal",
  END: "end"
};

let auctionsListingDiv, newBidDiv, moreBodyDiv, registeredDomainsListing, accountInfoDiv;
let api;

let auctionsMap = {
  // "fakeAuction": {
  //   domain: "fakeAuction",
  //   address: "0x0000",
  //   stage: "reveal",
  // }
};
let registeredDomainsMap = {};
let account = null;
let selectedAuction = {};

window.addEventListener("load", load);

async function load() {
  //get elements
  registeredDomainsListing = document.getElementById("registered__listing");

  //get api
  api = await app.getApi();

  document.getElementById("registered__button").onclick = fetchRegisteredDomains;
  document.getElementById("query__button").onclick = queryDomain;
  document.getElementById("new_bid__button").onclick = startNewBid;
  document.getElementById("add_bid__button").onclick = addBid;
  document.getElementById("reveal_bid__button").onclick = revealBid;
  document.getElementById("claim__button").onclick = claimDomain;
  document.getElementById("transaction__send").onclick = sendEther;

  //renders + state changes
  await fetchRegisteredDomains();

  //set event subscriptions
  api.subscribe("NewDomainClaimed", ({ newOwner, node }) => {
    registeredDomainsMap[node] = {
      domain: node,
      address: newOwner,
    };
    renderRegisteredDomains();
  });
  api.subscribe("AuctionExpired", ({ node }) => {
    delete auctionsMap[node];
    renderAuctionsListing();
  })
}

//button functions
async function startNewBid() {
  const domain = document.getElementById("new_bid__domain").value;
  const amount = document.getElementById("new_bid__amount").value;
  const salt = document.getElementById("new_bid__salt").value;

  if (domain === "") {
    alert("Domain cannot be empty string");
    return;
  } else if (amount <= 0) {
    alert("Amount has to be positive");
    return;
  }

  try {
    await api.startBid(domain, amount, salt);
  } catch (e) {
    alert("Failed to start bid");
  }
}

async function addBid() {
  const domain = document.getElementById("add_bid__domain").value;
  const amount = document.getElementById("add_bid__amount").value;
  const salt = document.getElementById("add_bid__salt").value;

  if (domain === "") {
    alert("Domain cannot be empty string");
    return;
  } else if (amount <= 0) {
    alert("Amount has to be positive");
    return;
  }

  try {
    await api.addBid(domain, amount, salt);
  } catch (e) {
    alert("Failed to add bid");
  }
}

async function revealBid() {
  const domain = document.getElementById("reveal_bid__domain").value;
  const amount = document.getElementById("reveal_bid__amount").value;
  const salt = document.getElementById("reveal_bid__salt").value;

  if (domain === "") {
    alert("Domain cannot be empty string");
    return;
  } else if (amount <= 0) {
    alert("Amount has to be positive");
    return;
  }

  try {
    await api.revealBid(domain, amount, salt);
  } catch (e) {
    alert("Failed to reveal bid");
  }
}

async function claimDomain() {
  const domain = document.getElementById("claim__domain").value;
  const address = document.getElementById("claim__address").value;
  const amount = document.getElementById("claim__amount").value;
  if (domain === "") {
    alert("Domain cannot be empty string");
    return;
  } else if (!api.isAddress(address)){
    alert("Address not valid");
    return;
  } else if (amount <= 0) {
    alert("Amount has to be positive");
    return;
  }

  try {
    await api.claimDomain(domain, address, amount);
  } catch (e) {
    alert("Failed to claim domain");
  }
}

async function sendEther() {
  const domain = document.getElementById("transaction__domain").value;
  const valueInWei = document.getElementById("transaction__amount").value;

  if (registeredDomainsMap[domain] === undefined) {
    alert("domain not registered, cannot send ether");
    return;
  } else if (parseInt(valueInWei) <= 0) {
    alert("ether must be > 0");
    return;
  }

  try {
    await api.sendEther(domain, valueInWei);
  } catch (e) {
    alert(e)
  }
}

//render functions
function renderMore({ domain, address, stage }) {
  if (
    selectedAuction.address === address
    && selectedAuction.stage === stage
  ) return;
  selectedAuction = { domain, address, stage };

  moreBodyDiv.innerHTML = "";

  const f = fragment();
  const h3 = element("h3");
  const h4 = element("h4");
  h3.innerText = `${domain}\n${address}`;
  h4.innerText = "Stage: " + stage;
  f.appendChild(h3);
  f.appendChild(h4);
  let b;
  switch (stage) {
    case auctionStage.BID:
      const { i, c, s, e } = bidMenu();
      b = button("Bid", async () => {
        if (i.value <= 0) {
          alert("bid must be greater than 0");
          return;
        } else if (!s) {
          alert("secret cannot be empty");
          return
        }
        try {
          await api.bid(domain, new app.Bid(i.value, c.checked, s.value));
        } catch (e) {
          //if there is an issue, it is likely the stage is off (therefore update stage)
          auctionsMap[domain].stage = await api.getAuctionStage(auctionsMap[domain].address);
          alert("cannot bid");
          renderAuctionsListing();
          console.log(e);
        }
      });
      f.appendChild(e);
      f.appendChild(b);
      break;
    case auctionStage.REVEAL:
      const d = element("div");
      const t = divWithText("Note: Be sure to include ALL your bids in a single reveal.");
      const menus = [];
      const menu = bidMenu();
      menu.e.classList.add("bid_menu");
      menus.push(menu);
      const buttonAdd = button("Add Another Bid", () => {
        const menu = bidMenu();
        menus.push(menu);
        menu.e.classList.add("bid_menu");
        d.appendChild(menu.e);
      });
      b = button("Reveal", async () => {
        const bids = menus.map(({ i, c, s }) => new app.Bid(i.value, c.checked, s.value));
        try {
          await api.reveal(domain, bids);
        } catch (e) {
          //if there is an issue, it is likely the stage is off (therefore update stage)
          auctionsMap[domain].stage = await api.getAuctionStage(auctionsMap[domain].address);
          alert("cannot reveal");
          renderAuctionsListing();
          console.log(e);
        }
      });
      d.appendChild(menu.e);
      f.appendChild(t);
      f.appendChild(d);
      f.appendChild(buttonAdd);
      f.appendChild(b);
      break;
    case auctionStage.END:
      b = button("Try Claim", async () => {
        try {
          await api.claim(domain);
        } catch (e) {
          alert("failed to claim")
        }
      });
      f.appendChild(b);
      break;
    default:
  }
  moreBodyDiv.appendChild(f);
}

function renderAuctionsListing() {
  auctionsListingDiv.innerHTML = "";

  const f = fragment();
  const auctions = Object.values(auctionsMap);

  if (auctions.length) {
    auctions.forEach(auction => {
      const d = element("div");
      d.appendChild(divWithText("Domain: " + auction.domain));
      d.appendChild(divWithText("Address: " + auction.address));
      d.appendChild(divWithText("Stage: " + auction.stage));
      d.onclick = () => renderMore(auction);
      f.appendChild(d);
    });
  } else {
    auctionsListingDiv.appendChild(divWithText("No auctions currently"));
  }
  auctionsListingDiv.appendChild(f);

  if (selectedAuction.domain) renderMore(auctionsMap[selectedAuction.domain]);
}

function renderRegisteredDomains() {
  registeredDomainsListing.innerHTML = "";

  const f = fragment();
  const registered = Object.values(registeredDomainsMap);

  if (registered.length) {
    registered.forEach(({ domain, address }) => {
      const d = element("div");
      d.appendChild(divWithText("Domain: " + domain));
      d.appendChild(divWithText("Address: " + address));
      d.onclick = () => {
        document.getElementById("transaction__domain").value = domain;
        document.getElementById("transaction__amount").value = 0;
      }
      f.appendChild(d);
    })
  } else {
    registeredDomainsListing.appendChild(divWithText("No registered domains currently"));
  }
  registeredDomainsListing.appendChild(f)
}

async function renderAccount() {
  try {
    const { address, balance } = await api.getAccount();
    account = { address, balance };

    accountInfoDiv.innerHTML = "";

    accountInfoDiv.appendChild(divWithText("Address: " + address));
    accountInfoDiv.appendChild(divWithText("Balance: " + balance + " ETH"));
  } catch (e) {
    alert(e);
  }
}

//state changes
async function fetchRegisteredDomains() {
  try {
    const registered = await api.getRegisteredDomains();
    registered.forEach(register => registeredDomainsMap[register.domain] = register);
    renderRegisteredDomains();
  } catch (e) {
    alert("cannot fetch registered domains");
    console.log(e);
  }
}

async function queryDomain() {

}

//utility
function divWithText(text) {
  const d = element("div");
  d.innerText = text;
  return d;
}

function bidMenu() {
  const e = element("div");
  const { i, e: ei } = labelInputPair("Amount (Wei): ", "number", 0);
  const { i: c, e: ec } = labelInputPair("Fake Bid: ", "checkbox");
  const { i: s, e: es } = labelInputPair("Secret: ", "text");
  e.appendChild(ei);
  e.appendChild(ec);
  e.appendChild(es);
  return { i, c, s, e }
}

function labelInputPair(label, inputType, defaultValue) {
  const e = element("div");
  const l = element("label");
  l.innerText = label;
  const i = element("input");
  i.type = inputType;
  if (defaultValue !== undefined) i.value = defaultValue;
  e.appendChild(l);
  e.appendChild(i);
  return { l, i, e };
}

function label(text) {
  const l = element("label");
  l.innerText = text;
  return l;
}

function input(type) {
  const i = element("input")
  i.type = type;
  return i;
}

function button(text, callback = () => { }) {
  const b = element("button");
  b.innerText = text;
  b.onclick = callback;
  return b;
}

function element(element) {
  return document.createElement(element)
}

function fragment() {
  return document.createDocumentFragment();
}