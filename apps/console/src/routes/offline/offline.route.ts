/**
 * Stackra file contract:
 * Purpose: `/offline`: the page the service worker serves for a navigation when even the cached app
 *          shell is missing. Its page is `offline.tsx` beside it, bound by name.
 * Boundary: `prerender: true` makes gen render it at build time once per locale, at each locale's
 *           lowercase prefix (`/offline`, `/en-us/offline`, `/ar/offline`, `/ar-sa/offline`), with
 *           its own small hydration entry, and the worker precaches every copy. So it can run no
 *           loader and needs no session (`auth: false`): everything it shows comes from hooks that
 *           work on the device. Outside the shell, in `PublicLayout`, which carries the theme's
 *           mark. The title is the page's `pages::offline.title`.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0255 (offline page), ADR 0252, ADR 0297
 *                     (lowercase locale prefixes)
 */
import { Route } from "@stackra/navigation";
import { I18n } from "#stackra/i18n";
import { PublicLayout } from "#src/routes/public/public.layout";

/** Route `/offline`: prerendered per locale, served by the worker when nothing else can be. */
export class OfflineRoute extends Route({
  path: "/offline",
  layout: PublicLayout,
  auth: false,
  prerender: true,
  title: I18n.pages.offline.title,
}) {}
