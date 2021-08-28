const utils = require("./utils");
const { asyncGetRequest, asyncPostRequest, getOptions } = utils;

async function getChannelFees() {
  let res = await asyncGetRequest(
    getOptions("https://localhost:8080/v1/channels")
  );
  console.log(res.body.channels);
}
getChannelFees();
