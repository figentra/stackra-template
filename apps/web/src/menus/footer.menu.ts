/**
 * Stackra file contract:
 * Purpose: the site footer's legal navigation: the privacy and terms pages, which are tenant
 *          builder pages served by the catch-all `Routes.page`.
 * Boundary: a second `@Menu` of kind `Navigation`; items name routes by generated key with the
 *          page's path as the splat, so each link resolves to the visitor's locale mount and a
 *          removed route is a type error. The footer renders it; no path string is written there.
 * Runtime: isomorphic
 * Governing contract: ADR 0114 (legal pages are builder pages), ADR 0165 (React Router 7)
 */
import { Menu, MenuKind, type MenuBuilder } from "@stackra/navigation";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";

/** The two legal links, privacy first. */
@Menu({ kind: MenuKind.Navigation })
export class FooterMenu {
  /** Each item is the tenant's published page at that path. */
  items(m: MenuBuilder) {
    return [
      m.route(Routes.page, { label: I18n.web.footer.privacy, params: { "*": "privacy" } }),
      m.route(Routes.page, { label: I18n.web.footer.terms, params: { "*": "terms" } }),
    ];
  }
}
