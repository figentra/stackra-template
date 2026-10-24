/**
 * Stackra file contract:
 * Purpose: the site header's navigation: home; a "Shop" group whose sub-navigation is the store and
 *          pricing; a "Resources" group with the tenant's help centre (shown only where the
 *          `web.help_centre` flag is on) and the developer docs on their own host; and contact.
 * Boundary: a menu of kind `Navigation`, using only the closed item verbs (`route`, `link`,
 *           `group`). Route items name routes by generated key (`Routes.store`), never by importing
 *           a route class (links point down: a menu sits above the routes), so each link resolves
 *           to the visitor's locale mount and a removed route is a type error. An item's `flag`
 *           hides it where the flag is off; the public site has no session, so no item is hidden by
 *           role here (a `roles` option does that on a signed-in surface). The external link comes
 *           from `SiteConfig.docsUrl` and opens in a new tab. The header renders it; no path string
 *           is written here.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0295 (decision 12)
 */
import { Menu, MenuKind, type MenuBuilder } from "@stackra/navigation";
import { Flags } from "#stackra/flags";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";
import type { SiteConfig } from "#src/config/site.config";

/** Home, two groups with their sub-navigation, and contact. */
export class SiteMenu extends Menu({ kind: MenuKind.Navigation }) {
  /**
   * @param site - the site config; its `docsUrl` is the external docs link.
   */
  constructor(private readonly site: SiteConfig) {
    super();
  }

  /** Home first, contact last; the active link is marked by the router. */
  items(m: MenuBuilder) {
    return [
      m.route(Routes.landing, { label: I18n.web.nav.home, end: true }),
      m.group(I18n.web.nav.shop, [
        m.route(Routes.store, { label: I18n.web.nav.store }),
        m.route(Routes.pricing, { label: I18n.web.nav.pricing }),
      ]),
      m.group(I18n.web.nav.resources, [
        m.route(Routes.page, {
          label: I18n.web.nav.help,
          params: { "*": "help" },
          flag: Flags.web.help_centre,
        }),
        m.link(I18n.web.nav.docs, this.site.docsUrl, { external: true }),
      ]),
      m.route(Routes.contact, { label: I18n.web.nav.contact }),
    ];
  }
}
