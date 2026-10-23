/**
 * Stackra file contract:
 * Purpose: the console's override of @stackra/csp's configuration: its Content Security Policy
 *          additions, read by the generated Electron main (the CSP header of `app://`) and by the
 *          web targets' headers.
 * Boundary: an override declares `override` members only and inherits the base's key (`csp`).
 *           Additions only: `connect-src` always holds the env's API, realtime and Sentry DSN
 *           origins (derived by gen); the baseline policy and its fixed directives are the
 *           package's and cannot be loosened here. The console adds nothing today; an origin goes
 *           here, not into a generated file.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19), ADR 0251 (desktop hardening), ADR 0237 (edge headers)
 */
import { CspConfig } from "@stackra/csp";

/** What the console adds to the baseline policy. */
export class ConsoleCspConfig extends CspConfig {
  /** `connect-src` origins beyond the env-derived ones. */
  override extraConnectSrc: string[] = [];

  /** `img-src` origins for product images served from the media CDN. */
  override extraImgSrc: string[] = [];
}
