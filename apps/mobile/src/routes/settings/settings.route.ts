/**
 * Stackra file contract:
 * Purpose: the settings tab root: language, appearance, notifications, privacy choices, profile,
 *          sign out, version.
 * Boundary: a route class: options only; the page composes the i18n, theme, push, consent and
 *           session hooks. The page is `settings.tsx`, bound by name; the title is
 *           `mobile::routes.settings.title`.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0295 (decisions 11 and 12), ADR 0071,
 *                     ADR 0080, ADR 0192, ADR 0206
 */
import { HeaderStyle, Route } from "@stackra/navigation";
import { Icons } from "@stackra/ui/icons";
import { TabsLayout } from "#src/routes/tabs/tabs.layout";

/** The third tab. */
export class SettingsRoute extends Route({
  path: "/settings",
  layout: TabsLayout,
  tab: {
    order: 3,
    icon: Icons.Settings,
  },
  chrome: { header: HeaderStyle.Large },
}) {}
