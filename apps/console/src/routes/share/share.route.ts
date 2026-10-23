/**
 * Stackra file contract:
 * Purpose: `/share`: the PWA share target. Another app's share sheet posts title, text, link and
 *          images to `/share` (pwa.config.ts `manifest.shareTarget`); the service worker keeps the
 *          payload on the device and redirects to `/share?shared=<id>`, which this route reads. Its
 *          page is `share.tsx` beside it, bound by name.
 * Boundary: the loader takes the payload once from the platform's share inbox (an unknown or used
 *           id gives `null`, the empty state); nothing is uploaded until the user picks a product
 *           and presses attach. Inside the shell, so a signed-out user signs in first and comes
 *           back with the id; the payload waits on the device meanwhile. The route calls no query,
 *           so it derives no permission; the attach action checks its own. Gen adds the locale
 *           prefix to the manifest's action per locale. The title is `pages::share.title`.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0255 (share target), ADR 0250 (capability
 *                     ports)
 */
import { Route, type RouteContext } from "@stackra/navigation";
import { I18n } from "#stackra/i18n";
import { ShellLayout } from "#src/routes/shell/shell.layout";

/** Route `/share`: what another app shared, ready to attach to a product. */
export class ShareRoute extends Route({
  path: "/share",
  layout: ShellLayout,
  title: I18n.pages.share.title,
}) {
  /** The shared payload, taken once from the device; `null` when there is none. */
  override async loader(ctx: RouteContext<this>) {
    const id = ctx.search.shared;
    return { shared: id ? await ctx.platform.shareTarget.take(id) : null };
  }
}
