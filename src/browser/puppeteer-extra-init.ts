import { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } from "puppeteer";
import puppeteer from "puppeteer-extra";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import devtools from "puppeteer-extra-plugin-devtools";

// import RecaptchaPlugin from "puppeteer-extra-plugin-recaptcha";
import SessionPlugin from "puppeteer-extra-plugin-session";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import MyHelloPlugin from "./examplePlugin";

/**
 * 对 puppeteer-extra 相关插件进行必要的初始化
 */
export function puppeteerExtraInit() {
  puppeteer.use(StealthPlugin());
  puppeteer.use(SessionPlugin());
  const devToolsPlugin = devtools();
  puppeteer.use(devToolsPlugin);

  puppeteer.use(
    AdblockerPlugin({
      // Optionally enable Cooperative Mode for several request interceptors
      interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY,
    }),
  );
  const myHelloPlugin = MyHelloPlugin({});
  puppeteer.use(myHelloPlugin);

  // puppeteer.use(
  //   RecaptchaPlugin({
  //     provider: {
  //       id: '2captcha',
  //       token: 'XXXXXXX' // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
  //     },
  //     visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
  //   })
  // )
}
