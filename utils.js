import axios from "axios";
import { spawn } from "node:child_process";
import {getInstalledBrowsers} from "@puppeteer/browsers";

export async function waitOn({
  url,
  validateResponse,
  timeoutMs = 20000,
  intervalMs = 1000,
}) {
  if (!url) throw new Error('waitOn: "url" is required.');

  const start = Date.now();
  console.log(`⏳ Waiting on ${url}...`);

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await axios.get(url);

      const statusOk = response.status >= 200 && response.status < 300;
      const validationOk = validateResponse ? validateResponse(response) : true;

      if (statusOk && validationOk) {
        console.log(`✅ Resource at ${url} is ready.`);
        return;
      } else {
        console.log(`ℹ️ Resource responded but validation failed. Retrying...`);
      }
    } catch (err) {
      console.log(
        `⚠️ Error reaching ${url}: ${err.message || err}. Retrying...`
      );
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`❌ Timeout after ${timeoutMs / 1000}s waiting on ${url}`);
}

export async function startHub() {
  const hub = spawn(
    "java",
    [
      "-jar",
      "selenium-server-standalone-3.141.59-hub.jar",
      "-role",
      "hub",
      "-port",
      "4444",
    ],
    {
      stdio: "inherit",
    }
  );

  process.on("exit", () => hub.kill());
  console.log("Waiting for Selenium Hub...");
  await waitOn({
    url: "http://localhost:4444/wd/hub/status",
  });
  console.log("Selenium Hub ready.");
  return hub;
}

export async function startNode() {
  const cacheDir = "./chrome-base";
  const [chrome, chromedriver] = await getInstalledBrowsers({
    cacheDir,
  });

  if (!chrome || !chromedriver) {
    console.error("Browsers not found!");
    process.exit(1);
  }

  const node = spawn(
    "java",
    [
      `-Dwebdriver.chrome.driver=${chromedriver.executablePath}`,
      "-jar",
      "selenium-server-standalone-3.141.59-node.jar",
      "-role",
      "node",
      "-hub",
      "http://localhost:4444/grid/register",
      `-browser`,
      `browserName=chrome,chromeOptions.binary=${chrome.executablePath}`,
    ],
    { stdio: "inherit" }
  );

  process.on("exit", () => node.kill());

  console.log("Waiting for Selenium Node...");
  await waitOn({
    url: "http://localhost:4444/grid/console",
  });
  await waitOn({
    url: "http://localhost:4444/wd/hub/status",
    validateResponse: (response) => {
      return response?.data?.value?.ready;
    },
  });
  console.log("Selenium Node ready.");
  return node;
}
