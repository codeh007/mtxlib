import type { Browser } from "puppeteer";
import puppeteer from "puppeteer-extra";
import { installBrowser } from "./browser";
import { puppeteerExtraInit } from "./puppeteer-extra-init";
puppeteerExtraInit();

const browsers: Record<string, Browser> = {};

export async function puppeteerLunchWithConfig(browserItem) {
  console.log("调用 puppeteerLunchWithConfig", browserItem);
  const browserInstance = browsers[browserItem.id];
  if (!browserInstance) {
    const installedBrowser = await installBrowser();
    if (!installedBrowser) {
      throw new Error("browser not installed");
    }
    const browser = await puppeteer.launch({
      args: [
        // '--start-maximized',
        "--no-sandbox",
        // '--auto-open-devtools-for-tabs',
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
      ],
      headless: false,
      defaultViewport: null,
      executablePath: installedBrowser.executablePath,
    });

    // browsers[browserItem.id] = browser;
  }

  const b = browsers[browserItem.id];
  b.connected;

  return browsers[browserItem.id];
}

export async function puppeteerOpenUrl(browser: Browser, url: string) {
  const page = await browser.newPage();

  console.log("page.goto", url);
  await page.goto(url, { waitUntil: "domcontentloaded" });
  console.log("page. domcontentloaded", url);

  //将会话信息保存到后端。
  // const sessionData = await page.session.dump();
  // console.log("session data", sessionData);

  // await page.goto('https://bot.sannysoft.com')
  // await sleep(5000)
  await page.screenshot({ path: "testresult.png", fullPage: true });
  const page2 = await browser.newPage();
  page2.goto("http://httpbin.org/cookies");

  // const sessionData = await page.session.dump();
  // console.log("session data", sessionData)
}
