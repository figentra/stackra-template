/**
 * Stackra file contract:
 * Purpose: the public site's root: the provider order. Routes, the layout, blocks, menus, flags,
 *          overrides and config are discovered by kind folder and decorator; blocks need no
 *          registry.
 * Boundary: the decorator options are the declaration gen reads; no DI provider list, no `forRoot`,
 *           no values. The site context has no behaviour before mount (its value is the layout's
 *           `resolve`), so it is listed by component with `from: SiteLayout`.
 * Runtime: isomorphic
 * Governing contract: ADR 0263 (wiring is generated), ADR 0175 (sites by host)
 */
import { App } from "@stackra/app";
import { Toast } from "@stackra/ui";
import { SiteContextProvider } from "#src/providers/site/site.context";
import { SiteLayout } from "#src/routes/site.layout";

/**
 * Site (from the layout's resolve) → toasts (innermost, so the contact form can raise one).
 * Container, i18n,
 * theming, consent, analytics, flags and telemetry are mounted by the generated root from their
 * config classes.
 */
@App({
  providers: [{ component: SiteContextProvider, from: SiteLayout }, Toast.Provider],
})
export class WebApp {}
