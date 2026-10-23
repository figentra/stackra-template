/**
 * Stackra file contract:
 * Purpose: proves the frame writes a tenant's colours as a nonce-bearing style only when theming
 *          allows the override, drops colours that fail the token grammar, and offers the skip link
 *          to the main landmark first.
 * Boundary: unit tier, jsdom; the site is the render option's resolved site, the nonce the testing
 *           CSP provider's.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0175
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { ThemingConfig } from "@stackra/theming";
import { Site } from "#src/routes/site/site";

/** A tenant site with its own accent, in both schemes. */
const BRAND = {
  accent: {
    light: "oklch(60% 0.2 30)",
    dark: "oklch(70% 0.18 30)",
    hexLight: "#D9462B",
    hexDark: "#F06A4A",
  },
};

/** Guards the frame around every public page. */
describe(Site, () => {
  /** The tenant's accent reaches HeroUI's variable through one style element the CSP allows. */
  it("writes the tenant brand with the request nonce", () => {
    const { container } = render(<Site />, {
      locale: "en",
      route: "/",
      site: { brand: BRAND },
      nonce: "n0nce",
    });
    const style = container.ownerDocument.querySelector("style[data-brand]") as HTMLStyleElement;
    expect(style.nonce).toBe("n0nce");
    expect(style.textContent).toContain("--accent: oklch(60% 0.2 30);");
    expect(style.textContent).toContain("--accent: oklch(70% 0.18 30);");
    expect(screen.getAllByRole("link")[0]).toHaveTextContent("Skip to content");
  });

  /** With the override off, the `acme` theme alone applies. */
  it("writes no brand style when theming turns the override off", () => {
    const { container } = render(<Site />, {
      locale: "en",
      route: "/",
      site: { brand: BRAND },
      config: [[ThemingConfig, { tenantOverride: false }]],
    });
    expect(container.ownerDocument.querySelector("style[data-brand]")).toBeNull();
  });

  /** A value outside the colour grammar could escape its declaration, so the colours are dropped. */
  it("writes no brand style when a tenant colour fails the token grammar", () => {
    const hostile = { accent: { ...BRAND.accent, light: "red; } body { display: none" } };
    const { container } = render(<Site />, {
      locale: "en",
      route: "/",
      site: { brand: hostile },
    });
    expect(container.ownerDocument.querySelector("style[data-brand]")).toBeNull();
  });
});
