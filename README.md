# HubSpot Form selector for Kentico Cloud

[![Stack Overflow](https://img.shields.io/badge/Stack%20Overflow-ASK%20NOW-FE7A16.svg?logo=stackoverflow&logoColor=white)](https://stackoverflow.com/tags/kentico-cloud)

This repository contains the sample source code of HubSpot Form selector custom element for Kentico Cloud.

Note that the code needs to be adjusted for your specific needs and properly tested for production use.

## Run

HubSpot Form selector uses OAuth to authenticate against HubSpot and is based on [this example](https://github.com/HubSpot/oauth-quickstart-nodejs).

The authentication token for a particular client is stored server-side based on NodeJS session ID, which is the default provided by the HubSpot example. Should you need more client-side approach, consider rewriting the code to store the authentication token to a browser cookie.  

For more information about OAuth and HubSpot authentication see [HubSpot documentation](https://developers.hubspot.com/docs/methods/oauth2/oauth2-overview).

Prerequisites:
* Node.js
* git

```
git clone https://github.com/Kentico/cloud-custom-element-sample-hubspot.git
cd kc-hubspot
npm install
npm run start
```

The element will be running at https://localhost:3000, note that the element needs to be hosted in an IFRAME to initialize properly. See section **Use** 

Also, note that you should deploy the custom element to a live NodeJS instance for production use. Use the actual URL instead of https://localhost:3000 for production deployment.

## HubSpot configuration

HubSpot **Client ID** and **Client secret** are provided as constants in a file `server/hubspot.js`. Sample credentials are provided by default.

In order to connect the form selector to your HubSpot account, replace them with the respective values from the **application** registered under your **HubSpot developer account**.  

## Use

If you want to use HubSpot Form selector in your project in Kentico Cloud, follow these steps:

* Run the HubSpot Form selector code (see section **Run**)
* In Kentico Cloud open Content models tab
* Open / create a content model to which you want to add HubSpot selector
* Add **Custom element** content element
* Open configuration of the content element
* Use the following URL as Hosted code URL (HTTPS): https://localhost:3000

## Example output

The element will save a value containing the selected form id and name. 

```
{
    "id": "176bcb4d-cbc3-45f0-b11a-f6230c4360f2",
    "name": "Contact us",
    "portalId": "5975142"
}
```

# Live site implementation sample

If you want to see live site example of HubSpot form displayed on the live site, browse to a [deployed sample site](https://kentico-cloud-sample-app-react-hubspot.surge.sh/en-us/articles/cf106f4e-30a4-42ef-b313-b8ea3fd3e5c5).

See source code of the sample site implementation [here](https://github.com/Kentico/cloud-sample-app-react/commit/aae72eb1e2195aced965c0e60729f691141f9ca1).

![Analytics](https://kentico-ga-beacon.azurewebsites.net/api/UA-69014260-4/Kentico/cloud-custom-element-sample-hubspot?pixel)
