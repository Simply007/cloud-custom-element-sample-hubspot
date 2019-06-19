/* Inspired by https://github.com/HubSpot/oauth-quickstart-nodejs/blob/master/index.js */

const request = require('request-promise-native');
const NodeCache = require('node-cache');
const session = require('express-session');

const CLIENT_ID = '866987af-ec4d-4acd-9d8c-d5d4ee11eb7d';
const CLIENT_SECRET = '8a23563b-96ca-4c4a-8c90-2f610064c5e1';

const SCOPES = 'forms contacts';

const refreshTokenStore = {};
const accessTokenCache = new NodeCache({deleteOnExpire: true});

function setupHubSpot(app, port) {
    // Use a session to keep track of client ID
    app.use(session({
        secret: Math.random().toString(36).substring(2),
        resave: false,
        saveUninitialized: true
    }));

    //================================//
    //   Running the OAuth 2.0 Flow   //
    //================================//

    // Step 1
    // Build the authorization URL to redirect a user
    // to when they choose to install the app
    function getRedirectUrl(req) {
        return `${req.protocol}://${req.get('host')}/oauth-callback`;
    }

    function getAuthUrl(req) {

        const authUrl =
            'https://app.hubspot.com/oauth/authorize' +
            `?client_id=${encodeURIComponent(CLIENT_ID)}` + // app's client ID
            `&scope=${encodeURIComponent(SCOPES)}` + // scopes being requested by the app
            `&redirect_uri=${encodeURIComponent(getRedirectUrl(req))}`; // where to send the user after the consent page

        return authUrl;
    }

    // Redirect the user from the installation page to
    // the authorization URL
    app.get('/install', (req, res) => {
        console.log('Initiating OAuth 2.0 flow with HubSpot');
        console.log("Step 1: Redirecting user to HubSpot's OAuth 2.0 server");
        res.redirect(getAuthUrl(req));
        console.log('Step 2: User is being prompted for consent by HubSpot');
    });

    // Step 2
    // The user is prompted to give the app access to the requested
    // resources. This is all done by HubSpot, so no work is necessary
    // on the app's end

    // Step 3
    // Receive the authorization code from the OAuth 2.0 Server,
    // and process it based on the query parameters that are passed
    app.get('/oauth-callback', async (req, res) => {
        console.log('Step 3: Handling the request sent by the server');

        // Received a user authorization code, so now combine that with the other
        // required values and exchange both for an access token and a refresh token
        if (req.query.code) {
            console.log('  > Received an authorization token');

            const authCodeProof = {
                grant_type: 'authorization_code',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: getRedirectUrl(req),
                code: req.query.code
            };

            // Step 4
            // Exchange the authorization code for an access token and refresh token
            console.log('Step 4: Exchanging authorization code for an access token and refresh token');
            const token = await exchangeForTokens(req.sessionID, authCodeProof);
            if (token.message) {
                return res.redirect(`/error?msg=${token.message}`);
            }

            // Once the tokens have been retrieved, use them to make a query
            // to the HubSpot API
            res.redirect(`/authenticated.html`);
        }
    });

    app.get('/error', (req, res) => {
        res.setHeader('Content-Type', 'text/html');
        res.write(`<h4>Error: ${req.query.msg}</h4>`);
        res.end();
    });

    //==========================================//
    //   Exchanging Proof for an Access Token   //
    //==========================================//

    const exchangeForTokens = async (userId, exchangeProof) => {
        try {
            const responseBody = await request.post('https://api.hubapi.com/oauth/v1/token', {
                form: exchangeProof
            });
            // Usually, this token data should be persisted in a database and associated with
            // a user identity.
            const tokens = JSON.parse(responseBody);
            refreshTokenStore[userId] = tokens.refresh_token;
            accessTokenCache.set(userId, tokens.access_token, Math.round(tokens.expires_in * 0.75));

            console.log('  > Received an access token and refresh token');
            return tokens.access_token;
        } catch (e) {
            console.error(`  > Error exchanging ${exchangeProof.grant_type} for access token`);
            return JSON.parse(e.response.body);
        }
    };

    const refreshAccessToken = async (req, userId) => {
        const refreshTokenProof = {
            grant_type: 'refresh_token',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: getRedirectUrl(req),
            refresh_token: refreshTokenStore[userId]
        };
        return await exchangeForTokens(userId, refreshTokenProof);
    };

    //====================================================//
    //   Using an Access Token to Query the HubSpot API   //
    //====================================================//

    const getForms = async (accessToken) => {
        console.log('Retrieving forms from HubSpot using an access token');
        try {
            const headers = {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            };
            const result = await request.get('https://api.hubapi.com/forms/v2/forms', {
                headers: headers
            });

            return JSON.parse(result);
        } catch (e) {
            console.error('  > Unable to retrieve forms');
            return JSON.parse(e.response.body);
        }
    };

    const getAccessToken = async (req, userId) => {
        // If the access token has expired, retrieve
        // a new one using the refresh token
        if (!accessTokenCache.get(userId)) {
            console.log('Refreshing expired access token');
            await refreshAccessToken(req, userId);
        }
        return accessTokenCache.get(userId);
    };

    const isAuthorized = (userId) => {
        return refreshTokenStore[userId] ? true : false;
    };

    app.get('/forms', async (req, res) => {
        if (isAuthorized(req.sessionID)) {
            const accessToken = await getAccessToken(req, req.sessionID);
            const forms = await getForms(accessToken);
            res.write(JSON.stringify(forms));
        } else {
            res.sendStatus(401);
        }
        res.end();
    });

    app.get('/signout', (req, res) => {
        if (isAuthorized(req.sessionID)) {
            const userId = req.sessionID;
            refreshTokenStore[userId] = undefined;
            accessTokenCache.set(userId, undefined, 0);
        }
        res.end();
    });

    app.get('/status', (req, res) => {
        if (isAuthorized(req.sessionID)) {
            res.sendStatus(200);
        }
        else {
            res.sendStatus(401);
        }
        res.end();
    });
}

module.exports = {
    setupHubSpot
};
