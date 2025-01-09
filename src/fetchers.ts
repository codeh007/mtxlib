import { z } from "zod";
import { newPuppeteerFetcher } from "../../mtxlib/src/browser/puppeteer-fetcher";
export const CRAWL_FETCH_TYPE = ["fetch", "puppeteer"] as const;
const fetchTypeSchema = z.enum(CRAWL_FETCH_TYPE);

export type FETCHTYPE = z.infer<typeof fetchTypeSchema>;

export function getFetcher(fetchType: FETCHTYPE) {
  let fetcher: typeof fetch = fetch;
  if (fetchType === "puppeteer") {
    fetcher = newPuppeteerFetcher();
  }
  return fetcher;
}
