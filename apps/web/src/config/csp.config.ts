/**
 * Stackra file contract:
 * Purpose: the site's override of @stackra/csp's configuration: its Content Security Policy
 *          additions and rollout mode, read by the generated Worker when it sets the header of
 *          every response; the image origins also become preconnect links in the document head.
 * Boundary: an override declares `override` members only and inherits the base's key (`csp`).
 *           Additions only: `connect-src` always holds the gateway origin from env; scripts and
 *           styles are nonce-based (the Worker mints one per request); the baseline policy and its
 *           fixed directives are the package's and cannot be loosened here.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: the Base alias),
 *                     ADR 0237 (edge headers)
 */
import { CspConfig as BaseCspConfig } from "@stackra/csp";

/** What the site adds to the baseline policy. */
export class CspConfig extends BaseCspConfig {
  /** `connect-src` additions: the analytics ingest and Turnstile. */
  override extraConnectSrc: string[] = [
    "https://eu.i.posthog.com",
    "https://challenges.cloudflare.com",
  ];

  /** `frame-src` additions: the Turnstile widget. */
  override extraFrameSrc: string[] = ["https://challenges.cloudflare.com"];

  /** `img-src` additions: the media CDN that serves product image variants. */
  override extraImgSrc: string[] = [];

  /**
   * Send the policy as `Content-Security-Policy-Report-Only`: violations are reported, nothing is
   * blocked. Turn it off once a release has run with no reports, and the policy enforces.
   */
  override reportOnly = true;
}
