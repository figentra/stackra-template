/**
 * Stackra file contract:
 * Purpose: the app's tab bar: exactly the tab routes (home, orders, settings) in their declared
 *          `tab.order`, with nothing added. The one file to edit to rearrange the bar or add an
 *          entry that is not a tab route.
 * Boundary: a menu of kind TabBar, at most one per app, starting from `m.tabs()` (the routes that
 *           declare `tab: { order, icon }`). Each item's label is its route's derived title and
 *           its test id `tab-<route key>`; a tab whose route the actor may not open (orders without
 *           `orders.order.read`) is hidden. The tenant and the active role may adjust the items at
 *           run time for presentation only (ADR 0273). Look and behaviour are `chrome.config.ts`.
 * Runtime: react-native
 * Governing contract: ADR 0295 (decision 12), ADR 0294 (decision 16), ADR 0273
 */
import { Menu, type MenuBuilder, MenuKind } from "@stackra/navigation";

/** Home, orders, settings: the order the three tab routes declare. */
export class TabBarMenu extends Menu({ kind: MenuKind.TabBar }) {
  /** The tab routes as declared; rearranging them is a change to this list. */
  items(m: MenuBuilder) {
    return [m.tabs()];
  }
}
