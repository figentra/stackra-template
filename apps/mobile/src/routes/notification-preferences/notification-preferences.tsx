/**
 * Stackra file contract:
 * Purpose: the notification preferences page: the generated user-scope settings form of the
 *          notifications service.
 * Boundary: a class component bound to `NotificationPreferencesRoute` by its file name, its props
 *           typed `RouteProps<typeof NotificationPreferencesRoute>`; composition only. Fields,
 *           defaults, labels and validation come from `SettingsPages.messages` (the `messages` keys
 *           of `#stackra/settings`); reads and writes go through the settings actions inside
 *           `SettingsForm`. Nothing here names a field.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 7 and 14, as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0062, ADR 0213
 */
import type { RouteProps } from "@stackra/navigation/native";
import { SettingsForm } from "@stackra/settings/native";
import { Component } from "#stackra/ui";
import { Screen } from "#src/components/screen";
import type { NotificationPreferencesRoute } from "#src/routes/notification-preferences/notification-preferences.route";
import { SettingsPages } from "#stackra/settings";

/** The generated form for the signed-in user's own preferences. */
export class NotificationPreferences extends Component<
  RouteProps<typeof NotificationPreferencesRoute>
> {
  /** The settings form inside the screen. */
  render() {
    return (
      <Screen testID="notification-preferences-page">
        <SettingsForm page={SettingsPages.messages} />
      </Screen>
    );
  }
}
