import { myPuppeteerLunch } from "./browser";

type CustomRequestInit = RequestInit & {
  // cookieStr?: string;
  // token?: string;
  // enableCache?: boolean;
  // enableLog?: boolean;
  // gomtmHost?: string;
};
/**
 * 基于 puppetteer 的 fetch 函数
 *功能等同于 原生 fetch 函数，但是内部使用 puppeteer 打开真实浏览器进行请求
 */
export function newPuppeteerFetcher(initGlobal?: any) {
  return async (
    input: string | URL | globalThis.Request,
    init?: CustomRequestInit,
  ): Promise<Response> => {
    if (init) {
      delete init.mode;
      delete init.credentials;
    }
    const req: CustomRequestInit = {
      ...init,
      ...initGlobal,
      redirect: "follow",
    } as CustomRequestInit;

    if (req.body instanceof Uint8Array) {
      const decoder = new TextDecoder();
      req.body = decoder.decode(req.body);
    }
    let url = "";
    if (typeof input == "string") {
      url = input;
    }
    const browser = await myPuppeteerLunch();
    const page = await browser.newPage();
    const navigationPromise = page.waitForNavigation({
      waitUntil: "networkidle0",
      timeout: 120000,
    });
    await page.goto(url, { waitUntil: "networkidle0", timeout: 120000 });
    await navigationPromise;
    const htmlContent = await page.content();
    await browser.close();
    return new Response(htmlContent);
  };
}
