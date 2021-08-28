const fs = require("fs");
const axios = require("axios");
const request = require("request");
const CHANNEL_LOOKUP = require("./channelLookup");

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
    },
    form: JSON.stringify(requestBody)
  }
  if (requestBody) {
    //options.form = JSON.stringify(requestBody);
  }
  //console.log(options);
  return options;
}

async function getChannels() {
  let res = await asyncGetRequest(getOptions("https://localhost:8080/v1/channels"));
  let channels = res.body.channels.map((channel) => {
    return {
      active: channel.active,
      remote_pubkey: channel.remote_pubkey,
      chan_id: channel.chan_id,
      capacity: channel.capacity,
      local_balance: channel.local_balance,
      remote_balance: channel.remote_balance,
    }
  })

  let localHeavy = channels.filter((channel) => {
    return channel.local_balance > 750000 && ((channel.local_balance/channel.capacity) > .75)
    //console.log(channel.active, channel.remote_pubkey, channel.chan_id, channel.capacity, channel.local_balance, channel.remote_balance);
  })
  let remoteHeavy = channels.filter((channel) => {
    return channel.remote_balance > 750000 && ((channel.local_balance/channel.capacity) < .25)
  })

  let routesToScan = [];

  for(let i = 0; i < localHeavy.length; i++) {
    for(let j = 0; j < remoteHeavy.length; j++) {
      const route = {
        destPubKey: localHeavy[i].remote_pubkey,
        destBalance: localHeavy[i].local_balance,
        destChanID: localHeavy[i].chan_id,
        outgoingPubKey: remoteHeavy[j].remote_pubkey,
        outgoingChanID: remoteHeavy[j].chan_id,
        outgoingBalance: remoteHeavy[j].local_balance,
      }
      routesToScan.push(route);
    }
  }
  //console.log(routesToScan);
  for(let i = 0; i < routesToScan.length; i++) {
    let requestBody = {
      outgoing_chan_id: routesToScan[i].outgoingChanID,
    }
    let routeResponse = await asyncGetRequest(getOptions(`https://localhost:8080/v1/graph/routes/${routesToScan[i].destPubKey}/10000?outgoing_chan_id=${routesToScan[i].outgoingChanID}`));
    let numHops = routeResponse && routeResponse.body.routes && routeResponse.body.routes[0].hops.length

    if(numHops && numHops < 5) {
      console.log(numHops, CHANNEL_LOOKUP.CHANNELS[routesToScan[i].destPubKey], CHANNEL_LOOKUP.CHANNELS[routesToScan[i].outgoingPubKey]);
    }
  }
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

async function findRebalanceRoutes() {
  console.log("HII");
}
//findRebalanceRoutes();

