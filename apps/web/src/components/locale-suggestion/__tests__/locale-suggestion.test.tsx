/**
 * Stackra file contract:
 * Purpose: proves the banner offers the locale the browser prefers, opens the same page in that
 *          locale's mount, hides for good when the visitor stays, and offers nothing when the
 *          browser already prefers the page's locale or the site does not ship the preferred one.
 * Boundary: unit tier, jsdom; the browser's languages are stubbed on `navigator`, the router is the
 *           testing router starting on `/pricing`, and each render starts with no locale choice.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0297 (decision 4)
 */
import { Locale } from "@stackra/i18n";
import { afterEach, describe, expect, it, vi } from "@stackra/testing";
import { render, screen, userEvent } from "@stackra/testing/react";
import { LocaleSuggestion } from "#src/components/locale-suggestion";

/** Makes the browser report these languages, most preferred first. */
const browserPrefers = (...languages: string[]) =>
  vi.spyOn(navigator, "languages", "get").mockReturnValue(languages);

/** Guards the only way the site offers another locale: never a redirect, always a choice. */
describe(LocaleSuggestion, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** A Saudi browser on the English pricing page is offered `/ar-sa/pricing`, not the home page. */
  it("offers the preferred regional locale and opens the same page in its mount", async () => {
    browserPrefers("ar-SA", "en");
    const { router } = render(<LocaleSuggestion locale={Locale.En} />, {
      locale: "en",
      route: "/pricing",
    });
    expect(await screen.findByRole("region", { name: "Language suggestion" })).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: /^Switch to العربية/ }));
    expect(router.state.location.pathname).toBe("/ar-sa/pricing");
  });

  /** A language-only preference gets the base language, not a region it never asked for. */
  it("offers the base language for a language-only preference", async () => {
    browserPrefers("ar");
    const { router } = render(<LocaleSuggestion locale={Locale.En} />, {
      locale: "en",
      route: "/pricing",
    });
    await userEvent.click(await screen.findByRole("button", { name: /^Switch to العربية/ }));
    expect(router.state.location.pathname).toBe("/ar/pricing");
  });

  /** Staying is remembered: the banner goes and the page stays where it was. */
  it("hides when the visitor keeps the current language", async () => {
    browserPrefers("ar");
    const { router } = render(<LocaleSuggestion locale={Locale.En} />, {
      locale: "en",
      route: "/pricing",
    });
    await userEvent.click(await screen.findByRole("button", { name: "Keep this language" }));
    expect(screen.queryByRole("region", { name: "Language suggestion" })).toBeNull();
    expect(router.state.location.pathname).toBe("/pricing");
  });

  /** Nothing to offer: the browser prefers the page's locale or one the site does not ship. */
  it("offers nothing when no other shipped locale is preferred", () => {
    browserPrefers("fr-FR", "en-GB");
    render(<LocaleSuggestion locale={Locale.En} />, { locale: "en", route: "/pricing" });
    expect(screen.queryByRole("region", { name: "Language suggestion" })).toBeNull();
  });
});
