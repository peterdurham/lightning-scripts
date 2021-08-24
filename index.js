const fs = require("fs");
const axios = require("axios");
const request = require("request");
const macaroon = fs
  .readFileSync(
    "/home/umbrel/umbrel/lnd/data/chain/bitcoin/mainnet/admin.macaroon"
  )
  .toString("hex");

async function asyncGetRequest(options) {
  return new Promise((resolve, reject) => {
    request.get(options, (error, response, body) => resolve({ error, response, body}));
  });
}
async function asyncPostRequest(options) {
  return new Promise((resolve, reject) => {
    request.post(options, (error, response, body) => resolve({ error, response, body }));
  });
}

let options = {
  url: "https://localhost:8080/v1/channels",
  // Work-around for self-signed certificates.
  rejectUnauthorized: false,
  json: true,
  headers: {
    "Grpc-Metadata-macaroon": macaroon,
  },
};

function getOptions(url, requestBody = null) {
  let options = {
    url: url,
    rejectUnauthorized: false,
    json: true,
    headers: {
      "Grpc-Metadata-macaroon": macaroon,
    }
  }
  if (requestBody) {
    options.form = JSON.stringify(requestBody);
  }
console.log(options);
  return options;
}

async function getChannels() {
  let res = await asyncGetRequest(getOptions("https://localhost:8080/v1/channels"));
  console.log(res.body);
}
getChannels();


async function getRoutes(pubkey, amount, channelID) {
  let requestBody = {
    outgoing_chan_id: channelID,
  }
  let res = await asyncGetRequest(getOptions(`https://localhost:8080/v1/graph/routes/${pubkey}/${amount}`, requestBody));
  console.log(res)
  console.log(res.body.routes[0].hops);
}
//getRoutes('03e94e144ad749a1cb11972212267fac12c0abfe0ca5a33985dcece556e62a1443', 10000, '762809281549762560');

// TODO: set function for get channels
