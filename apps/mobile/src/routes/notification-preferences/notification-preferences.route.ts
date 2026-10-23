/**
 * Stackra file contract:
 * Purpose: the user's notification preferences: the generated settings page of the notifications
 *          service's messages module (user scope).
 * Boundary: a route class: options only; the fields, defaults and labels come from
 *           `#stackra/settings`, the values from the settings actions, so nothing here restates a
 *           field. The page is `notification-preferences.tsx`, bound by name; the title is
 *           `pages::notification_preferences.title`.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0062, ADR 0213
 */
import { Route } from "@stackra/navigation";

/** A pushed screen from Settings. */
export class NotificationPreferencesRoute extends Route({ path: "/settings/notifications" }) {}
