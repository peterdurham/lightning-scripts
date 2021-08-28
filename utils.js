async function asyncGetRequest(options) {
  return new Promise((resolve, reject) => {
    request.get(options, (error, response, body) =>
      resolve({ error, response, body })
    );
  });
}
async function asyncPostRequest(options) {
  return new Promise((resolve, reject) => {
    request.post(options, (error, response, body) =>
      resolve({ error, response, body })
    );
  });
}

function getOptions(url, requestBody = null) {
  let options = {
    url: url,
    rejectUnauthorized: false,
    json: true,
    headers: {
      "Grpc-Metadata-macaroon": macaroon,
    },
    form: JSON.stringify(requestBody),
  };
  return options;
}

module.exports = {
  asyncGetRequest,
  asyncPostRequest,
  getOptions,
};
