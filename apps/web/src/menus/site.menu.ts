/**
 * Stackra file contract:
 * Purpose: the site header's navigation: home, store, pricing and contact, in that order.
 * Boundary: a `@Menu` of kind `Navigation`; items name routes by generated key (`Routes.store`),
 *           never by importing a route class (links point down: a menu sits above the routes), so
 *           each link resolves to the visitor's locale mount and a removed route is a type error.
 *           The header renders it; no path string is written here.
 * Runtime: isomorphic
 * Governing contract: ADR 0165 (React Router 7)
 */
import { Menu, MenuKind, type MenuBuilder } from "@stackra/navigation";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";

/** The four header links. */
@Menu({ kind: MenuKind.Navigation })
export class SiteMenu {
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
