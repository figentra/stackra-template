/**
 * Stackra file contract:
 * Purpose: proves the hreflang alternates are symmetric: a prefixed and an unprefixed path give the
 *          same map, the default locale is `x-default`, and a page slug is never mistaken for a
 *          locale prefix.
 * Boundary: unit tier; pure function over a fake context holding the real i18n config.
 * Runtime: node
 * Governing contract: ADR 0022, ADR 0080, ADR 0007
 */
import { metaContextFor } from "@stackra/navigation/testing";
import { describe, expect, it } from "@stackra/testing";
import { alternates } from "#src/server/alternates.server";

/** The map every case expects for the pricing page. */
const PRICING = {
  en: "https://www.example.com/pricing",
  ar: "https://www.example.com/ar/pricing",
  "x-default": "https://www.example.com/pricing",
};

/** Guards the one rule links, heads and sitemaps share. */
describe(alternates, () => {
  /** Arabic and English paths of one page must produce the same alternates. */
  it("gives the same map for the prefixed and the unprefixed path", () => {
    const ctx = metaContextFor({ site: { origin: "https://www.example.com" } });
    expect(alternates(ctx, "/ar/pricing")).toEqual(PRICING);
    expect(alternates(ctx, "/pricing")).toEqual(PRICING);
  });

  /** A slug that merely starts with a locale's letters is a page, not a prefix. */
  it("never reads a page slug as a locale prefix", () => {
    const ctx = metaContextFor({ site: { origin: "https://www.example.com" } });
    expect(alternates(ctx, "/archive")["x-default"]).toBe("https://www.example.com/archive");
  });
});
