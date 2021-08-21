const fs = require('fs');
const request = require('request');
const macaroon = fs.readFileSync('/home/umbrel/umbrel/lnd/data/chain/bitcoin/mainnet/admin.macaroon').toString('hex');

console.log(macaroon);

let options = {
  url: 'https://localhost:8080/v1/channels',
  // Work-around for self-signed certificates.
  rejectUnauthorized: false,
  json: true,
  headers: {
    'Grpc-Metadata-macaroon': macaroon,
  },
}
request.get(options, function(error, response, body) {
  console.log(options, error, response, body);
});

console.log("hi there");
