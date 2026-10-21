/**
 * Stackra file contract:
 * Purpose: one fact: the console's Content Security Policy additions, read by the generated
 *          Electron main (the CSP header of `app://`) and by the web targets' headers.
 * Boundary: additions only. `connect-src` always holds the env's API, realtime and Sentry DSN
 *           origins (derived by gen); the baseline policy and its fixed directives are
 *           @stackra/csp's and cannot be loosened here.
 * Runtime: isomorphic
 * Governing contract: ADR 0251 (desktop hardening), ADR 0237 (edge headers)
 */
import { Config } from "@stackra/config";
import { List, Url } from "@stackra/validation";

/** What the console adds to the baseline policy. */
@Config("console.csp")
export class CspConfig {
  /** `connect-src` origins beyond the env-derived ones. @defaultValue [] */
  @List(Url) extraConnectSrc: string[] = [];
  /** `img-src` origins for product images served from the media CDN. @defaultValue [] */
  @List(Url) extraImgSrc: string[] = [];
}
