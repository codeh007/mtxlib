import { Page, Target } from "puppeteer";
import { PuppeteerExtraPlugin } from "puppeteer-extra-plugin";

/**
 * 自定义 puppeteer 插件（范例）
 * 使用：
 *   const myHelloPlugin = MyHelloPlugin({})
      puppeteer.use(myHelloPlugin)
 */
class HelloPlugin extends PuppeteerExtraPlugin {
  constructor(opts = {}) {
    super(opts);
  }

  get name() {
    return "hello-world";
  }

  //@ts-ignore
  async onPageCreated(page: Page) {
    console.log("(hello-world plugin) page created", page.url());
    // this.debug("(hello-world plugin) page created", page.url());
    const ua = await page.browser().userAgent();
    console.log("user agent", ua);
  }
   //@ts-ignore
  async onTargetCreated(target: Target): Promise<void> {
    console.log("onTargetCreated", target.url());
  }
   //@ts-ignore
  async onTargetChanged(target: Target): Promise<void> {
    console.log("onTargetCreated", target.url());
  }
}

export default function MyHelloPlugin(pluginConfig: any) {
  return new HelloPlugin(pluginConfig);
}
