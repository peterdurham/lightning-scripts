const fs = require("fs");
const axios = require("axios");
const request = require("request");
const CHANNEL_LOOKUP = require("./channelLookup");

const utils = require("./utils");
const { asyncGetRequest, asyncPostRequest, getOptions } = utils;

const macaroon = fs
  .readFileSync(
    "/home/umbrel/umbrel/lnd/data/chain/bitcoin/mainnet/admin.macaroon"
  )
  .toString("hex");

async function rebalanceScan() {
  let res = await asyncGetRequest(
    getOptions("https://localhost:8080/v1/channels")
  );
  let channels = res.body.channels.map((channel) => {
    return {
      active: channel.active,
      remote_pubkey: channel.remote_pubkey,
      chan_id: channel.chan_id,
      capacity: channel.capacity,
      local_balance: channel.local_balance,
      remote_balance: channel.remote_balance,
    };
  });

  let localHeavy = channels.filter((channel) => {
    return (
      channel.local_balance > 750000 &&
      channel.local_balance / channel.capacity > 0.75
    );
  });
  let remoteHeavy = channels.filter((channel) => {
    return (
      channel.remote_balance > 750000 &&
      channel.local_balance / channel.capacity < 0.25
    );
  });

  let routesToScan = [];

  for (let i = 0; i < localHeavy.length; i++) {
    for (let j = 0; j < remoteHeavy.length; j++) {
      const route = {
        destPubKey: localHeavy[i].remote_pubkey,
        destBalance: localHeavy[i].local_balance,
        destChanID: localHeavy[i].chan_id,
        outgoingPubKey: remoteHeavy[j].remote_pubkey,
        outgoingChanID: remoteHeavy[j].chan_id,
        outgoingBalance: remoteHeavy[j].local_balance,
      };
      routesToScan.push(route);
    }
  }
  //console.log(routesToScan);
  for (let i = 0; i < routesToScan.length; i++) {
    let requestBody = {
      outgoing_chan_id: routesToScan[i].outgoingChanID,
    };
    let routeResponse = await asyncGetRequest(
      getOptions(
        `https://localhost:8080/v1/graph/routes/${routesToScan[i].destPubKey}/10000?outgoing_chan_id=${routesToScan[i].outgoingChanID}`
      )
    );
    let numHops =
      routeResponse &&
      routeResponse.body.routes &&
      routeResponse.body.routes[0].hops.length;

    if (numHops && numHops < 5) {
      console.log(
        numHops,
        CHANNEL_LOOKUP.CHANNELS[routesToScan[i].destPubKey],
        CHANNEL_LOOKUP.CHANNELS[routesToScan[i].outgoingPubKey]
      );
    }
  }
}
rebalanceScan();
