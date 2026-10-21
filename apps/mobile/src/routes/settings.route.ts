/**
 * Stackra file contract:
 * Purpose: the settings tab root: language, appearance, notifications, privacy choices, profile,
 *          sign out, version.
 * Boundary: options only; the page composes the i18n, theme, push, consent and session hooks.
 * Runtime: react-native
 * Governing contract: ADR 0071, ADR 0080, ADR 0192, ADR 0206
 */
import { Route } from "@stackra/navigation";
import { Icons } from "@stackra/ui/icons";
import { SettingsPage } from "#src/components/pages/settings";
import { TabsLayout } from "#src/routes/tabs.layout";
import { I18n } from "#stackra/i18n";

/** The third tab. */
@Route({
  path: "/settings",
  layout: TabsLayout,
  auth: true,
  tab: { order: 3, icon: Icons.Settings, label: I18n.mobile.tabs.settings, testId: "tab-settings" },
  header: { title: I18n.mobile.settings.title },
  component: SettingsPage,
})
export class SettingsRoute {}
