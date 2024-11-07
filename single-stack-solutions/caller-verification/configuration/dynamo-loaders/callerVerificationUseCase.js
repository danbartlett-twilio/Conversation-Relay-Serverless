const fs = require('fs');
const path = require('path');

const dynamoItem = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'dynamo-item.json')));
const functionManifest = require('../function-manifest');
const dtmfHandlers = require('../dtmf-handlers');

module.exports = {
    items: [
        {
            ...dynamoItem,
            functionManifest,
            dtmfHandlers
        }
    ]
};
