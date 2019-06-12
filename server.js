const opn = require('opn');
const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs');
const { setupHubSpot } = require('./server/hubspot');

const PORT = 3000;

async function main() {
    const app = express();

    // Basic form selector UI
    app.use(express.static(path.join(__dirname, 'public')));

    setupHubSpot(app, PORT);

    app.get('*', (req, res) => {
        res.redirect('/');
    });

    app.set('port', PORT);

    https.createServer(
        {
            key: fs.readFileSync('server/credentials/server.key'),
            cert: fs.readFileSync('server/credentials/server.cert'),
        },
        app
    ).listen(
        PORT,
        function () {
            console.log(`Custom element listening on port ${PORT}! Go to https://localhost:${PORT}/`);
        }
    );
}

main();
