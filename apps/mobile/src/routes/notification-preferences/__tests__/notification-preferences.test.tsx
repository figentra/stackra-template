/**
 * Stackra file contract:
 * Purpose: the page renders the generated user-scope form and writes a toggled preference at user
 *          scope only.
 * Boundary: unit tier; the settings fake records writes with their scope.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0213
 */
import { SettingScope } from "@stackra/settings";
import { fakeSettings } from "@stackra/settings/testing";
import { describe, expect, it } from "@stackra/testing";
import { renderRoute, screen, userEvent } from "@stackra/testing/native";
import { Routes } from "#stackra/routes";
import { SettingsPages } from "#stackra/settings";

/** The preferences page over its route. */
describe("NotificationPreferences", () => {
  /** A preference is the user's own: the write goes to user scope, never to the tenant. */
  it("writes a toggled preference at user scope", async () => {
    const settings = fakeSettings();
    renderRoute(Routes.notification_preferences, { locale: "en", settings });
    await userEvent.press(await screen.findByRole("switch", { name: "Marketing messages" }));
    expect(settings.writes).toEqual([
      {
        page: SettingsPages.messages,
        scope: SettingScope.User,
        values: { marketing: true },
      },
    ]);
  });
});
