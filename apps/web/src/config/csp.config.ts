/**
 * Stackra file contract:
 * Purpose: one fact: the site's Content Security Policy additions and its rollout mode, read by the
 *          generated Worker when it sets the header of every response; the image origins also
 *          become preconnect links in the document head.
 * Boundary: additions only. `connect-src` always holds the gateway origin from env; scripts and
 *           styles are nonce-based (the Worker mints one per request); the baseline policy and its
 *           fixed directives are @stackra/csp's and cannot be loosened here.
 * Runtime: isomorphic
 * Governing contract: ADR 0237 (edge headers)
 */
import { Config } from "@stackra/config";
import { Bool, List, Url } from "@stackra/validation";

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
  /**
   * Send the policy as `Content-Security-Policy-Report-Only`: violations are reported, nothing is
   * blocked. Turn it off once a release has run with no reports, and the policy enforces.
   * @defaultValue true
   */
  @Bool() reportOnly = true;
}
