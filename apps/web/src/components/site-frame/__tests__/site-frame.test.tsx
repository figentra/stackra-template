/**
 * Stackra file contract:
 * Purpose: proves the frame writes a tenant's brand as a nonce-bearing style only when theming
 *          allows the override, and offers the skip link to the main landmark first.
 * Boundary: unit tier, jsdom; the site is the render option's resolved site, the nonce the testing
 *           CSP provider's.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0175
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { SiteFrame } from "#src/components/site-frame";
import { ThemingConfig } from "#src/config/theming.config";

/** A tenant site with its own accent. */
const BRAND = { "color.accent": "oklch(60% 0.2 30)" };

/** Guards the frame around every public page. */
describe(SiteFrame, () => {
  /** The tenant's accent reaches the page through one style element the CSP allows. */
  it("writes the tenant brand with the request nonce", () => {
    const { container } = render(<SiteFrame />, {
      locale: "en",
      route: "/",
      site: { brand: BRAND },
      nonce: "n0nce",
    });
    const style = container.ownerDocument.querySelector("style[data-brand]") as HTMLStyleElement;
    expect(style.nonce).toBe("n0nce");
    expect(style.textContent).toContain("--brand-color-accent: oklch(60% 0.2 30)");
    expect(screen.getAllByRole("link")[0]).toHaveTextContent("Skip to content");
  });

  /** With the override off, the house brand alone applies. */
  it("writes no brand style when theming turns the override off", () => {
    const { container } = render(<SiteFrame />, {
      locale: "en",
      route: "/",
      site: { brand: BRAND },
      config: [[ThemingConfig, { tenantOverride: false }]],
    });
    expect(container.ownerDocument.querySelector("style[data-brand]")).toBeNull();
  });
});
