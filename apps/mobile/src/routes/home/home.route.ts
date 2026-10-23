/**
 * Stackra file contract:
 * Purpose: the home tab root: the dashboard widgets services declared for its slot, quick actions,
 *          and the links to the announcements and the inbox.
 * Boundary: a route class: options only, no loader, because the panel's widget slot fetches each
 *           widget's query itself and refreshes it on the declared events through the realtime
 *           connection. `path: "/"` makes it the landing route of the scheme and of universal
 *           links. The page is `home.tsx`, bound by name; the title is the derived key
 *           `mobile::routes.home.title`, which is also the tab's label.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0295 (decisions 11 and 12), ADR 0061,
 *                     ADR 0164
 */
import { HeaderStyle, Route } from "@stackra/navigation";
import { Icons } from "@stackra/ui/icons";
import { TabsLayout } from "#src/routes/tabs/tabs.layout";

/** The first tab, with a large title that collapses into the glass header. */
export class HomeRoute extends Route({
  path: "/",
  layout: TabsLayout,
  tab: {
    order: 1,
    icon: Icons.House,
  },
  chrome: { header: HeaderStyle.Large },
}) {}
