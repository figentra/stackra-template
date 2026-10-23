/**
 * Stackra file contract:
 * Purpose: links from the menu land in the visitor's locale mount, a group opens its
 *          sub-navigation, the flag-gated help centre shows only where its flag is on, the external
 *          docs link opens a new tab without the opener, and the scheme toggle sets `data-theme` on
 *          `<html>` and its pressed state.
 * Boundary: unit tier, jsdom, the @stackra/testing/react providers (router with every locale mount,
 *           i18n, theming, flags); the menu is the real `SiteMenu`, rendered by the navigation
 *           package.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0080, ADR 0007
 */
import { fakeFlags } from "@stackra/feature-flags/testing";
import { Locale } from "@stackra/i18n";
import { describe, expect, it } from "@stackra/testing";
import { render, screen, userEvent } from "@stackra/testing/react";
import { Flags } from "#stackra/flags";
import { SiteHeader } from "#src/components/site-header";

/** Guards the global navigation present on every public page. */
describe(SiteHeader, () => {
  /** A wrong prefix would send Arabic visitors to English pages or break default-locale URLs. */
  it("links to the visitor's locale mount from inside a group", async () => {
    render(<SiteHeader siteName="Acme" locale={Locale.ArSa} />, {
      locale: "ar-SA",
      route: "/ar-sa",
    });
    await userEvent.click(screen.getByText("تسوّق"));
    expect(screen.getByRole("link", { name: "المتجر" }).getAttribute("href")).toBe("/ar-sa/store");
  });

  /** The default locale stays unprefixed. */
  it("links the default locale without a prefix", async () => {
    render(<SiteHeader siteName="Acme" locale={Locale.En} />, { locale: "en", route: "/" });
    await userEvent.click(screen.getByText("Shop"));
    expect(screen.getByRole("link", { name: "Store" }).getAttribute("href")).toBe("/store");
    expect(screen.getByRole("link", { name: "Contact" }).getAttribute("href")).toBe("/contact");
  });

  /** The help centre is a release switch: hidden by default, listed where the flag is on. */
  it("lists the help centre only where its flag is on", async () => {
    const { unmount } = render(<SiteHeader siteName="Acme" locale={Locale.En} />, {
      locale: "en",
      route: "/",
    });
    await userEvent.click(screen.getByText("Resources"));
    expect(screen.queryByRole("link", { name: "Help centre" })).toBeNull();
    unmount();

    const flags = fakeFlags((fake) => fake.set(Flags.web.help_centre, true));
    render(<SiteHeader siteName="Acme" locale={Locale.En} />, { locale: "en", route: "/", flags });
    await userEvent.click(screen.getByText("Resources"));
    expect(screen.getByRole("link", { name: "Help centre" }).getAttribute("href")).toBe("/help");
  });

  /** An external link must say it opens a new tab and must not hand the opener to the other site. */
  it("opens the developer docs in a new tab without the opener", async () => {
    render(<SiteHeader siteName="Acme" locale={Locale.En} />, { locale: "en", route: "/" });
    await userEvent.click(screen.getByText("Resources"));
    const docs = screen.getByRole("link", { name: /Developer docs/ });
    expect(docs.getAttribute("href")).toBe("https://docs.acme.example");
    expect(docs.getAttribute("target")).toBe("_blank");
    expect(docs.getAttribute("rel")).toBe("noopener noreferrer");
    expect(docs).toHaveTextContent("(opens in a new tab)");
  });

  /** The scheme switch must update the document and its pressed state for assistive tech. */
  it("toggles the colour scheme on <html>", async () => {
    render(<SiteHeader siteName="Acme" locale={Locale.En} />, { locale: "en", route: "/" });
    const toggle = screen.getByRole("button", { name: "Colour scheme" });
    await userEvent.click(toggle);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    await userEvent.click(toggle);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});
