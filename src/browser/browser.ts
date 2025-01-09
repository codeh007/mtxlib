import * as browsers from "@puppeteer/browsers";
import os from "node:os";
import puppeteer, { type Browser } from "puppeteer";
import { PUPPETEER_REVISIONS } from "puppeteer-core/internal/revisions.js";
import { exec } from "../lib/exec";
// import { exec } from "../exec";

/**
 * 相关第三方 puppeteer 组件备忘
 *
 *  const puppeteer = require('puppeteer-extra')
    const prompt = require("prompt-sync")({ sigint: true });

    // add stealth plugin and use defaults (all evasion techniques)
    const StealthPlugin = require('puppeteer-extra-plugin-stealth')
    puppeteer.use(StealthPlugin());


    其中：
      prompt 用于询问是否退出 浏览器
      例如：
        await page.goto("https://bot.sannysoft.com/");
        finish = prompt("Shall we finish the program?");


   chrome 浏览器相关参数
    {
      headless : false,
      ignoreDefaultArgs: ["--enable-automation"],
    }

 * @param data
 */

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function log(...data: any[]) {
  // eslint-disable-next-line prefer-rest-params
  // biome-ignore lint/style/noArguments: <explanation>
  console.log.apply(console, [new Date().toISOString(), ...arguments]);
}

export async function installBrowser() {
  try {
    let downloaded = false;
    const chromeVersion = PUPPETEER_REVISIONS.chrome;
    const installResult = await browsers.install({
      browser: browsers.Browser.CHROME,
      buildId: chromeVersion,
      cacheDir: `${os.homedir()}/.cache/puppeteer`,
      downloadProgressCallback: (downloadedBytes, totalBytes) => {
        if (!downloaded) {
          downloaded = true;
          log(`Downloading the browser Chrome/${chromeVersion}...`);
        }
      },
    });
    return installResult;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (e: any) {
    /**
     * 说明：
     *      这里出现的异常是因为
     *       在 bun test 下，因http 模块不兼容导致 browsers.install 失败。
     *       可以使用单独命令 预先完成安装： npx puppeteer browsers install chrome
     */
    try {
      exec("bunx puppeteer browsers install chrome");
    } catch (e: any) {
      console.log(
        "安装chrome 失败， 可通过命令手工完成安装： npx puppeteer browsers install chrome",
      );
      throw e;
    }
  }
}

export async function showBrowserInfo(browser: Browser) {
  const wsEndpoint = browser.wsEndpoint();
  console.log({
    message: "browser info",
    wsEndpoint,
  });
}
// export async function browserOpenUrl(
//   url: string,
//   options?: {
//     debug?: boolean;
//     screenshotPath?: string;
//   },
// ) {
//   const installedBrowser = await installBrowser();
//   // if (options.debug) {
//   //   browserConfig = {
//   //     ...browserConfig,
//   //     headless: false,
//   //     devtools: true,
//   //     slowMo: 250,
//   //     dumpio: false,
//   //   }
//   // }
//   const browser = await puppeteer.launch({
//     args: [
//       // '--start-maximized',
//       "--no-sandbox",
//     ],
//     headless: false,
//     executablePath: installedBrowser.executablePath,
//   });

//   showBrowserInfo(browser);
//   try {
//     log(`Launched the ${await browser.version()} browser.`);
//     log("Setting the page viewport size...");
//     const page = (await browser.pages())[0];
//     // await page.setViewport({
//     //   // width: parseInt(options.viewportSize.split('x')[0], 10),
//     //   // height: parseInt(options.viewportSize.split('x')[1], 10),
//     //   deviceScaleFactor: 1,
//     // })
//     try {
//       const url = `https://en.wikipedia.org/wiki/Main_Page`;
//       log(`Loading ${url}...`);
//       await page.goto(url);
//     } finally {
//       log("Taking a screenshot...");
//       await page.screenshot({ path: options?.screenshotPath, fullPage: true });
//     }
//   } finally {
//     await browser.close();
//   }
// }

export async function myPuppeteerLunch() {
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
    executablePath: installedBrowser.executablePath,
  });
  return browser;
}
