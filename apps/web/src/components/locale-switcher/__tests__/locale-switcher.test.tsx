/**
 * Stackra file contract:
 * Purpose: proves the switcher is a labelled native select of the enabled locales, each option in
 *          its own language, and moving to Arabic goes to the same page in the Arabic mount.
 * Boundary: unit tier, jsdom; the router is the testing router, starting on `/pricing`.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0165
 */
import { Locale } from "@stackra/i18n";
import { describe, expect, it } from "@stackra/testing";
import { render, screen, userEvent } from "@stackra/testing/react";
import { LocaleSwitcher } from "#src/components/locale-switcher";

/** Guards the way between the two halves of the site. */
describe(LocaleSwitcher, () => {
  /** Switching keeps the page: `/pricing` becomes `/ar/pricing`, never the Arabic home. */
  it("moves to the same page in the chosen locale", async () => {
    const { router } = render(<LocaleSwitcher locale={Locale.En} />, {
      locale: "en",
      route: "/pricing",
    });
    const select = screen.getByRole("combobox", { name: "Language" });
    expect(screen.getByRole("option", { name: "العربية" }).getAttribute("lang")).toBe("ar");
    await userEvent.selectOptions(select, "ar");
    expect(router.state.location.pathname).toBe("/ar/pricing");
  });
});
