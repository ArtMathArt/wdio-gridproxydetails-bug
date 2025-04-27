# WebdriverIO `browser.gridProxyDetails` Bug Reproduction

Minimal reproducible setup to demonstrate an issue with the `browser.gridProxyDetails` method in WebdriverIO.

## Prerequisites

- Node.js (latest LTS recommended)
- Java (preferably version 11)

## Setup

```bash
npm install
npm run install-chrome-base
```

## Run the test to reproduce the issue

```bash
npm test
```

The `test` script will automatically:

- Start Selenium Grid Hub
- Start Selenium Node and register it
- Lookup executable paths for Chrome and Chromedriver from local `chrome-base` folder
- Run the WebdriverIO test

## Notes

- Java must be installed and available in your PATH (`java --version`).
- No manual Hub or Node startup is required.

## Issue

```bash
file:///<system_path>/wdio-gridproxydetails-bug/node_modules/webdriver/build/node.js:1758
      throw new WebDriverRequestError(err, url, opts);
            ^

WebDriverRequestError: WebDriverError: Request with GET/HEAD method cannot have body. when running "http://localhost:4444/grid/api/proxy" with method "GET" and args "{"id":"http://<ip_address>:64012"}"
    at FetchRequest._libRequest (file:///<system_path>/wdio-gridproxydetails-bug/node_modules/webdriver/build/node.js:1758:13)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async FetchRequest._request (file:///<system_path>/wdio-gridproxydetails-bug/node_modules/webdriver/build/node.js:1768:20)      
    at async Browser.wrapCommandFn (file:///<system_path>/wdio-gridproxydetails-bug/node_modules/@wdio/utils/build/index.js:907:23)    
    at async file:///<system_path>/wdio-gridproxydetails-bug/index.js:26:30
```
