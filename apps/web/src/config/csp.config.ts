/**
 * Stackra file contract:
 * Purpose: one fact: the site's Content Security Policy additions, read by the generated Worker
 *          when it sets the header of every response.
 * Boundary: additions only. `connect-src` always holds the gateway origin from env; the baseline
 *           policy and its fixed directives are @stackra/csp's and cannot be loosened here.
 * Runtime: isomorphic
 * Governing contract: ADR 0237 (edge headers), ADR 0176
 */
import { Config } from "@stackra/config";
import { List, Url } from "@stackra/validation";

/** What the site adds to the baseline policy. */
@Config("web.csp")
export class CspConfig {
  /** `connect-src` additions: the analytics ingest and Turnstile. */
  @List(Url) extraConnectSrc: string[] = [
    "https://eu.i.posthog.com",
    "https://challenges.cloudflare.com",
  ];
  /**
   * `frame-src` additions: the Turnstile widget.
   * @defaultValue ["https://challenges.cloudflare.com"]
   */
  @List(Url) extraFrameSrc: string[] = ["https://challenges.cloudflare.com"];
  /** `img-src` additions: the media CDN that serves product image variants. @defaultValue [] */
  @List(Url) extraImgSrc: string[] = [];
}
