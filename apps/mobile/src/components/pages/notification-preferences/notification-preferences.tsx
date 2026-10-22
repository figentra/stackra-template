/**
 * Stackra file contract:
 * Purpose: the notification preferences page: the generated user-scope settings form of the
 *          notifications service.
 * Boundary: composition only. Fields, defaults, labels and validation come from
 *           `SettingsPages.messages` (the `messages` keys of `#stackra/settings`); reads and writes
 *           go through the settings actions inside `SettingsForm`. Nothing here names a field.
 * Runtime: react-native
 * Governing contract: ADR 0062, ADR 0213
 */
import type { RouteComponent } from "@stackra/navigation/native";
import { SettingsForm } from "@stackra/settings/native";
import { Screen } from "#src/components/ui/screen";
import type { NotificationPreferencesRoute } from "#src/routes/notification-preferences.route";
import { SettingsPages } from "#stackra/settings";

/** The generated form for the signed-in user's own preferences. */
export const NotificationPreferencesPage: RouteComponent<
  typeof NotificationPreferencesRoute
> = () => (
  <Screen testID="notification-preferences-page">
    <SettingsForm page={SettingsPages.messages} />
  </Screen>
);
