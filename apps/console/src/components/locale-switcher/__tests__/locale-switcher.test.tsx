/**
 * Stackra file contract:
 * Purpose: choosing Arabic sets `lang="ar"` and `dir="rtl"` on the document and re-renders labels;
 *          the trigger's accessible name contains the language name it shows (WCAG 2.5.3).
 * Boundary: unit tier, jsdom; catalogues are the committed lang files loaded by the testing i18n
 *           provider.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0080
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen, userEvent } from "@stackra/testing/react";
import { LocaleSwitcher } from "#src/components/locale-switcher";

/** Guards language switching, which must also flip the layout direction. */
describe(LocaleSwitcher, () => {
  /** Arabic must set lang and rtl on the document or the whole layout is mirrored wrongly. */
  it("switches the document to Arabic, right-to-left", async () => {
    render(<LocaleSwitcher />, { locale: "en" });
    await userEvent.click(screen.getByRole("button", { name: "Language: English" }));
    await userEvent.click(screen.getByRole("menuitemradio", { name: "العربية" }));
    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
    expect(screen.getByRole("button", { name: "اللغة: العربية" })).toHaveTextContent("العربية");
  });
});
