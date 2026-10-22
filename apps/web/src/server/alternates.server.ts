/**
 * Stackra file contract:
 * Purpose: the same path in every locale, keyed by locale code, with `x-default`: the hreflang
 *          alternates every page's head, the sitemap and the canonical URL are built from.
 * Boundary: a pure function over the caller's context (its site origin and i18n config); one rule
 *           for heads and sitemaps so they never disagree.
 * Runtime: worker
 * Governing contract: ADR 0080 (locales), ADR 0176 (SEO on the Worker)
 */
import type { MetaContext } from "@stackra/navigation";
import { I18nConfig } from "#src/config/i18n.config";
import type { ResolvedSite } from "#src/server/resolve-site.server";
import { localePath } from "#src/server/locale-path.server";

/** What the helper reads from its caller: the config door and the resolved site. */
type AlternatesContext = Pick<MetaContext<unknown>, "config"> & { readonly site: ResolvedSite };

/** `{ en: "https://…/pricing", ar: "https://…/ar/pricing", "x-default": "https://…/pricing" }`. */
export function alternates(ctx: AlternatesContext, path: string): Record<string, string> {
  const i18n = ctx.config(I18nConfig);
  const codes = i18n.locales.map((l) => l.value).join("|");
  const unprefixed = localePath(
    i18n,
    i18n.defaultLocale,
    path.replace(new RegExp(`^/(${codes})(?=/|$)`), ""),
  );
  const entries = i18n.locales.map((l) => [
    l.value,
    `${ctx.site.origin}${localePath(i18n, l, unprefixed)}`,
  ]);
  return { ...Object.fromEntries(entries), "x-default": `${ctx.site.origin}${unprefixed}` };
}
