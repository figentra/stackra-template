/**
 * Stackra file contract:
 * Purpose: the block's props accept a navigate verb to a generated route key and an action verb
 *          with a key, and refuse a URL-shaped route.
 * Boundary: unit tier, pure; `validate` runs the schema gen compiled from the block's fields.
 * Runtime: isomorphic
 * Governing contract: ADR 0022, ADR 0110, ADR 0294 (decision 26)
 */
import { describe, expect, it } from "@stackra/testing";
import { validate } from "@stackra/validation";
import { PromoBannerBlock } from "#src/blocks/promo-banner/promo-banner.block";
import { CtaVerb } from "#src/enums/cta-verb.enum";
import { RouteKey } from "#stackra/routes";

/**
 * Validates a banner whose call to action navigates to `route`.
 * @param route - the route key, or anything else a document might hold.
 */
const navigate = (route: string) =>
  validate(PromoBannerBlock, {
    headline: "Hi",
    cta: { label: "Go", event: { verb: CtaVerb.Navigate, route } },
  });

/** The closed set of call-to-action targets. */
describe("PromoBannerBlock", () => {
  /** Only a route key of this app may be navigated to; a URL never passes. */
  it("accepts a navigate verb to a known route and refuses a URL", () => {
    expect(navigate(RouteKey.Scan).success).toBe(true);
    expect(navigate("https://evil.example").success).toBe(false);
  });

  /** The action verb carries a key; the union is told apart by its verb. */
  it("accepts an action verb with a key", () => {
    const result = validate(PromoBannerBlock, {
      headline: "Hi",
      cta: { label: "Order", event: { verb: CtaVerb.Action, key: "orders.order.create@1" } },
    });
    expect(result.success).toBe(true);
  });
});
