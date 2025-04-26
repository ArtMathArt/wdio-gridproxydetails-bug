import { remote } from "webdriverio";
import { strict as assert } from "node:assert";
import { startHub, startNode } from "./utils.js";

const hub = await startHub();
const node = await startNode();

try {
  const browser = await remote({
    hostname: "localhost",
    port: 4444,
    path: "/wd/hub",
    capabilities: {
      browserName: "chrome",
      "goog:chromeOptions": {
        args: ["headless", "disable-gpu"],
      },
      "wdio:enforceWebDriverClassic": true,
    },
  });

  try {
    await browser.url("https://webdriver.io");
    const gridTestSession = await browser.gridTestSession(browser.sessionId);
    const gridProxyDetails = await browser.gridProxyDetails(
      gridTestSession.proxyId
    );
    assert.equal(typeof gridProxyDetails.id, "string");
  } finally {
    await browser.deleteSession({
      shutdownDriver: true,
    });
  }
} finally {
  node.kill();
  hub.kill();
}
