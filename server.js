const opn = require('opn');
const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs');

async function main() {
    const app = express();

    // Basic form selector UI
    app.use(express.static(path.join(__dirname, 'public')));

    // TODO - Add OAuth handling here

    app.get('*', (req, res) => {
        res.redirect('/');
    });

    const port = process.env.PORT || 3000;
    app.set('port', port);

    https.createServer(
        {
            key: fs.readFileSync('server/credentials/server.key'),
            cert: fs.readFileSync('server/credentials/server.cert'),
        },
        app
    ).listen(
        port,
        function () {
            console.log(`Custom element listening on port ${port}! Go to https://localhost:${port}/`);
            opn('https://localhost:' + port);
        }
    );
}

main();
