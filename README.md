# HubSpot Form selector for Kentico Cloud

This repository contains source code of HubSpot Form selector custom element for Kentico Cloud

# Use

If you want to use HubSpot Form selector in your project in Kentico Cloud, follow these steps:

* In Kentico Cloud open Content models tab
* Open / create a content model to which you want to add HubSpot selector
* Add **Custom element** content element
* Open configuration of the content element
* Use following URL as Hosted code URL (HTTPS): https://kentico.github.io/custom-element-samples/HubSpot/form-selector.html

# Installation

If you want to adjust the implementation, first download [Kentico Cloud Custom Elements Devkit](https://github.com/kentico/custom-element-devkit). This repository should be positioned within `/client/custom-elements` folder. For further instructions on devkit implementation, please refer to [Custom Element Devkit README](https://github.com/Kentico/custom-element-devkit/blob/master/readme.md).

## Get started

Prerequisites:
* Node.js
* git

```
git clone https://github.com/Kentico/custom-element-devkit.git
cd custom-element-devkit
git clone https://github.com/kenticomartinh/kc-hubspot.git ./client/custom-elements/kc-hubspot
npm install --save react@^16.8.6 react-dom@^16.8.6 react-select@^2.4.3
npm start -- -hw
```

Browse: https://localhost:3000/custom-elements/kc-hubspot/wrap
