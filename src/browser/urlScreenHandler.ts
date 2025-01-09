import chromium from "@sparticuz/chromium-min";
import { NextResponse } from "next/server";
import puppeteer, { type Browser } from "puppeteer-core";
/************************************************************************************
 *
 * 在 vercel serverless 环境下，使用无头浏览器截屏。
 * 参考： 来自： https://www.hehehai.cn/posts/vercel-deploy-headless
 * https://github.com/Sparticuz/chromium
 * 使用库：
 *      "@sparticuz/chromium-min": "^119.0.2",
        "puppeteer-core": "^21.6.1",

 *
 ************************************************************************************/

const isDev = process.env.NODE_ENV === "development";
const localExecutablePath =
  process.platform === "win32"
    ? "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
    : process.platform === "linux"
      ? "/usr/bin/google-chrome"
      : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const remoteExecutablePath =
  "https://github.com/Sparticuz/chromium/releases/download/v119.0.2/chromium-v119.0.2-pack.tar";
export async function urlScreenHandler(req: Request) {
  let browser: Browser | null = null;
  console.log("启动urlScreenHandler", remoteExecutablePath);
  try {
    // const chromium = require("@sparticuz/chromium-min");
    // const puppeteer = require("puppeteer-core");

    browser = await puppeteer.launch({
      args: isDev ? [] : chromium.args,
      defaultViewport: { width: 1920, height: 1080 },
      executablePath: isDev
        ? localExecutablePath
        : await chromium.executablePath(remoteExecutablePath),
      headless: chromium.headless,
    });
    const page = await browser!.newPage();
    await page.goto("https://www.google.com", {
      waitUntil: "networkidle0",
      timeout: 8000,
    });
    console.log("page title", await page.title());
    const blob = await page.screenshot({ type: "png" });
    const headers = new Headers();
    headers.set("Content-Type", "image/png");
    headers.set("Content-Length", blob.length.toString());
    return new NextResponse(blob, { status: 200, statusText: "OK", headers });
  } catch (err: any) {
    console.log("urlScreenHandler出错:", err);
    return NextResponse.json(
      { error: "Internal Server Error:" + err.toString() },
      { status: 500 },
    );
  } finally {
    await browser?.close();
  }
}
