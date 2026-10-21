/**
 * Stackra file contract:
 * Purpose: the home tab root: the dashboard widgets services declared for the hosted panel, quick
 *          actions, and the links to the announcements and the inbox.
 * Boundary: options only; no loader and no prefetch: the panel fetches each widget's query itself
 *           and refreshes it on the declared events through the realtime connection. `index: true`
 *           with `path: "/"` makes it the landing route of the scheme and of universal links.
 * Runtime: react-native
 * Governing contract: ADR 0061, ADR 0164
 */
import { Route } from "@stackra/navigation";
import { Icons } from "@stackra/ui/icons";
import { HomePage } from "#src/components/pages/home";
import { TabsLayout } from "#src/routes/tabs.layout";
import { I18n } from "#stackra/i18n";

/** The first tab; `tab` names the bar entry and the id Maestro taps. */
@Route({
  path: "/",
  index: true,
  layout: TabsLayout,
  auth: true,
  tab: { order: 1, icon: Icons.House, label: I18n.mobile.tabs.home, testId: "tab-home" },
  header: { title: I18n.mobile.home.title },
  component: HomePage,
})
export class HomeRoute {}
