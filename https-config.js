const fs = require('fs');
module.exports = {
    cert: fs.readFileSync('localhost.pem'),
    key: fs.readFileSync('localhost-key.pem')
};
