/**
 * Stackra file contract:
 * Purpose: changing the language persists it to the `Prefs` area; sign out calls the session;
 *          analytics stays off until the user turns its consent switch on; the required
 *          necessary category is locked on.
 * Boundary: unit tier; the storage fake is in memory; the session fake records `signOut`; the
 *           consent fake records decisions.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0298, ADR 0071, ADR 0256
 */
import { ConsentCategory } from "@stackra/consent";
import { fakeConsent } from "@stackra/consent/testing";
import { Locale } from "@stackra/i18n";
import { SessionStatus } from "@stackra/identity";
import { fakeSession } from "@stackra/identity/testing";
import { fakeStorage } from "@stackra/storage/testing";
import { describe, expect, it } from "@stackra/testing";
import { renderRoute, screen, userEvent } from "@stackra/testing/native";
import { Routes } from "#stackra/routes";

/** The settings page over its route. */
describe("Settings", () => {
  /** The locale is a user setting kept in `Prefs`. */
  it("persists the chosen locale in prefs", async () => {
    const storage = fakeStorage();
    const { i18n } = renderRoute(Routes.settings, { locale: "en", storage });
    await userEvent.selectOption(screen.getByTestId("settings-language"), Locale.Ar);
    expect(i18n.locale).toBe(Locale.Ar);
  });

  /** Sign out is the session's; the page only asks. */
  it("signs out through the session", async () => {
    const session = fakeSession({ status: SessionStatus.SignedIn });
    renderRoute(Routes.settings, { locale: "en", session });
    await userEvent.press(screen.getByTestId("settings-sign-out"));
    expect(session.signOut).toHaveBeenCalled();
  });

  /** Nothing optional is granted by default; one switch grants exactly its category. */
  it("grants analytics consent only when its switch is turned on", async () => {
    const consent = fakeConsent();
    renderRoute(Routes.settings, { locale: "en", consent });
    expect(consent.isGranted(ConsentCategory.Analytics)).toBe(false);
    await userEvent.press(screen.getByTestId(`consent-${ConsentCategory.Analytics}`));
    expect(consent.isGranted(ConsentCategory.Analytics)).toBe(true);
    expect(consent.isGranted(ConsentCategory.CrashReplay)).toBe(false);
  });

  /** The necessary category is required: shown, granted and locked, never a choice. */
  it("locks the necessary category on", () => {
    renderRoute(Routes.settings, { locale: "en", consent: fakeConsent() });
    expect(screen.getByTestId(`consent-${ConsentCategory.Necessary}`)).toBeDisabled();
  });
});
