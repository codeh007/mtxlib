import { myPuppeteerLunch } from "../browser";

async function PuppeteerWithJquery() {
  const url = "https://www.bing.com";
  const browser = await myPuppeteerLunch();
  const page = await browser.newPage();
  const navigationPromise = page.waitForNavigation({
    waitUntil: "networkidle0",
    timeout: 120000,
  });
  await page.goto(url, { waitUntil: "networkidle0", timeout: 120000 });
  await page.addScriptTag({
    url: "https://code.jquery.com/jquery-3.6.0.min.js",
  });
  await navigationPromise;

  const isJQueryLoaded = await page.evaluate(() => !!(window as any)?.jQuery);
  if (!isJQueryLoaded) {
    throw new Error("jQuery not loaded");
  }

  // 通过 jquery api 获取数据
  const data = await page.evaluate(() => {
    const price = $("span._56dab877").text().trim();
    const title = $("h1.a38b8112").text().trim();
    const description = $("._0f86855a").text().trim();
    const features: string[] = [];
    $("._27f9c8ac")
      .children()
      .each(function () {
        features?.push($(this).text());
      });

    return { title, price, description, features };
  });
}
