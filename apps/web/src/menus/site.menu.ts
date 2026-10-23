/**
 * Stackra file contract:
 * Purpose: the site header's navigation: home, store, pricing and contact, in that order.
 * Boundary: a menu of kind `Navigation`, using only the closed item verbs; items name routes by
 *           generated key (`Routes.store`), never by importing a route class (links point down: a
 *           menu sits above the routes), so each link resolves to the visitor's locale mount and a
 *           removed route is a type error. The header renders it; no path string is written here.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0295 (decision 12)
 */
import { Menu, MenuKind, type MenuBuilder } from "@stackra/navigation";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";

/** The four header links. */
export class SiteMenu extends Menu({ kind: MenuKind.Navigation }) {
  /** Home first, contact last; the active link is marked by the router. */
  items(m: MenuBuilder) {
    return [
      m.route(Routes.landing, { label: I18n.web.nav.home, end: true }),
      m.route(Routes.store, { label: I18n.web.nav.store }),
      m.route(Routes.pricing, { label: I18n.web.nav.pricing }),
      m.route(Routes.contact, { label: I18n.web.nav.contact }),
    ];
  }
}
