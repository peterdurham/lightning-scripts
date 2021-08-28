const utils = require("./utils");
const { asyncGetRequest, asyncPostRequest, getOptions } = utils;

async function getChannelFees() {
  let chanResp = await asyncGetRequest(
    getOptions("https://localhost:8080/v1/channels")
  );
  let feeResp = await asyncGetRequest(
    getOptions("https://localhost:8080/v1/fees")
  );
  console.log(chanResp.body.channels);
  console.log(feeResp.body);
  const channels = chanResp.body.channels;

  for (let i = 0; i < channels.length; i++) {
    const res = await asyncGetRequest(
      getOptions(`https://localhost:8080/v1/graph/edge/${channels[i].chan_id}`)
    );
    console.log(res.body);
  }
}
getChannelFees();
