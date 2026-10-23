/**
 * Stackra file contract:
 * Purpose: the notification preferences page: the generated user-scope settings form of the
 *          notifications service.
 * Boundary: a function component bound to `NotificationPreferencesRoute` by its file name;
 *           composition only. Fields, defaults, labels and validation come from
 *           `SettingsPages.messages` (the `messages` keys of `#stackra/settings`); reads and writes
 *           go through the settings actions inside `SettingsForm`. Nothing here names a field.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 7 and 14), ADR 0062, ADR 0213
 */
import type { RouteComponent } from "@stackra/navigation/native";
import { SettingsForm } from "@stackra/settings/native";
import { Screen } from "#src/components/screen";
import type { NotificationPreferencesRoute } from "#src/routes/notification-preferences/notification-preferences.route";
import { SettingsPages } from "#stackra/settings";

/** The generated form for the signed-in user's own preferences. */
export const NotificationPreferences: RouteComponent<typeof NotificationPreferencesRoute> = () => (
  <Screen testID="notification-preferences-page">
    <SettingsForm page={SettingsPages.messages} />
  </Screen>
);
