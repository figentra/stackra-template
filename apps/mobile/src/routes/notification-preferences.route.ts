/**
 * Stackra file contract:
 * Purpose: the user's notification preferences: the generated settings page of the notifications
 *          service's `NotificationPreferences` (user scope).
 * Boundary: options only; the fields, defaults and labels come from `#stackra/settings`, the values
 *           from the settings actions. Nothing here restates a field.
 * Runtime: react-native
 * Governing contract: ADR 0062, ADR 0213
 */
import { Presentation, Route } from "@stackra/navigation";
import { NotificationPreferencesPage } from "#src/components/pages/notification-preferences";
import { I18n } from "#stackra/i18n";

/** A pushed card from Settings. */
@Route({
  path: "/settings/notifications",
  auth: true,
  presentation: Presentation.Card,
  header: { title: I18n.mobile.notification_preferences.title },
  component: NotificationPreferencesPage,
})
export class NotificationPreferencesRoute {}
