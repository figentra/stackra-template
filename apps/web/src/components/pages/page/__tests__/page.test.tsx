/**
 * Stackra file contract:
 * Purpose: proves a tenant page renders its published document through the experience renderer.
 * Boundary: unit tier, jsdom; the renderer is the experience package's, with the `@Block` classes
 *           of this app registered by the testing providers.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0114
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { TenantPage } from "#src/components/pages/page";

/** A published page whose document holds one call-to-action banner. */
const PAGE = {
  key: "about",
  seo: { title: "About us", description: null, noindex: false, image: null },
  root: {
    type: "web.cta_banner",
    props: {
      title: { en: "Talk to us" },
      button: { label: { en: "Contact" }, route: "contact" },
    },
  },
};

/** Guards the catch-all route's view of builder pages. */
describe(TenantPage, () => {
  /** The document's blocks render with their own props, links included. */
  it("renders the published document's blocks", () => {
    render(<TenantPage data={{ page: PAGE }} />, { locale: "en", route: "/about" });
    expect(screen.getByRole("heading", { name: "Talk to us" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Contact" }).getAttribute("href")).toBe("/contact");
  });
});
