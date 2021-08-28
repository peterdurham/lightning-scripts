const utils = require("./utils");
const { asyncGetRequest, asyncPostRequest, getOptions } = utils;

async function getChannelFees() {
  let chanResp = await asyncGetRequest(
    getOptions("https://localhost:8080/v1/channels")
  );
  let feeResp = await asyncGetRequest(getOptions("https://localhost:8080/v1/fees"));
  console.log(chanResp.body.channels);
  console.log(feeResp.body);
}
getChannelFees();
