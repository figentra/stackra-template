/**
 * Stackra file contract:
 * Purpose: the block props accept a navigate verb to a generated route key and refuse a URL-shaped
 *          one.
 * Boundary: unit tier, pure.
 * Runtime: isomorphic
 * Governing contract: ADR 0022, ADR 0110
 */
import { describe, expect, it } from "@stackra/testing";
import { PromoBannerProps } from "#src/schemas/promo-banner.schema";

/** The closed set of navigation targets. */
describe("PromoBannerProps", () => {
  /** Only a `RouteKey` of this app may be navigated to; a URL never passes. */
  it("accepts a navigate verb to a known route and refuses a URL", () => {
    expect(
      PromoBannerProps.safeParse({
        headline: "Hi",
        cta: { label: "Go", event: { verb: "navigate", route: "scan" } },
      }).success,
    ).toBe(true);
    expect(
      PromoBannerProps.safeParse({
        headline: "Hi",
        cta: { label: "Go", event: { verb: "navigate", route: "https://evil" } },
      }).success,
    ).toBe(false);
  });
});
