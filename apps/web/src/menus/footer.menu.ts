/**
 * Stackra file contract:
 * Purpose: the site footer's legal navigation: the privacy and terms pages, which are tenant
 *          builder pages served by the catch-all `Routes.page`.
 * Boundary: a second menu of kind `Navigation`, using only the closed item verbs; items name
 *           routes by generated key with the page's path as the splat, so each link resolves to
 *           the visitor's locale mount and a removed route is a type error. The footer renders it;
 *           no path string is written there.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0295 (decision 12), ADR 0114 (legal
 *                     pages are builder pages)
 */
import { Menu, MenuKind, type MenuBuilder } from "@stackra/navigation";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";

/** The two legal links, privacy first. */
export class FooterMenu extends Menu({ kind: MenuKind.Navigation }) {
  /** Each item is the tenant's published page at that path. */
  items(m: MenuBuilder) {
    return [
      m.route(Routes.page, { label: I18n.web.footer.privacy, params: { "*": "privacy" } }),
      m.route(Routes.page, { label: I18n.web.footer.terms, params: { "*": "terms" } }),
    ];
  }
}
