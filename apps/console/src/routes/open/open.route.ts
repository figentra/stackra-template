/**
 * Stackra file contract:
 * Purpose: `/open`: where an outside link lands. The PWA protocol handler (`web+acme://…`) and the
 *          desktop deep link (`acme-console://…`) both open `/open?url=<link>`; the route turns the
 *          link into the in-app path it names and redirects there inside the shell. It never
 *          renders, so the folder has no page.
 * Boundary: only the schemes the console registers are accepted (pwa.config.ts
 *           `manifest.protocolHandlers`, desktop.config.ts `deepLinks.scheme`, both injected by
 *           type). The in-app path is resolved against the console's own origin first and checked
 *           after that normalisation: a link that leaves the origin, or whose path reads as
 *           `//host` or holds a backslash once dot segments are resolved
 *           (`acme-console://.//host`), goes to `/`, and so does a foreign scheme or an unparsable
 *           link. The shell's loader runs first, so a signed-out user signs in and comes back here.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 14, 16 and 17), ADR 0255 (PWA manifest), ADR 0254
 *                     (desktop deep links), ADR 0241
 */
import { Route, type RouteContext } from "@stackra/navigation";
import type { DesktopConfig, PwaConfig } from "@stackra/platform";
import { ShellLayout } from "#src/routes/shell/shell.layout";

/**
 * `acme-console://orders/orders/ord_1` → `/orders/orders/ord_1`. A custom scheme parses its first
 * segment as the host, so the path is host + pathname; the result is the normalised in-app path.
 */
function pathOf(raw: string | undefined, schemes: readonly string[]): string {
  if (!raw) return "/";
  try {
    const link = new URL(raw);
    if (!schemes.includes(link.protocol)) return "/";
    const candidate = `/${link.host}${link.pathname}`.replace(/(?<=.)\/+$/, "");
    const here = new URL(globalThis.location.href);
    const target = new URL(`${candidate}${link.search}${link.hash}`, here);
    // protocol + host, not `origin`: the desktop's `app:` scheme has an opaque origin
    const leaves = target.protocol !== here.protocol || target.host !== here.host;
    // checked on the resolved path: `/.//host` and `/%2e%2e//host` read as `//host` only after it
    if (leaves || target.pathname.startsWith("//") || target.pathname.includes("\\")) return "/";
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/"; // not a URL at all
  }
}

/** Route `/open`: resolves an outside link to an in-app path. */
export class OpenRoute extends Route({
  path: "/open",
  layout: ShellLayout,
}) {
  /**
   * @param pwa - the console's PWA config; its protocol handlers name the web scheme.
   * @param desktop - the console's desktop config; its deep links name the desktop scheme.
   */
  constructor(
    private readonly pwa: PwaConfig,
    private readonly desktop: DesktopConfig,
  ) {
    super();
  }

  /** Redirects to the linked path, or the panel root when the link is not one of ours. */
  override loader(ctx: RouteContext<this>) {
    const schemes = [
      ...Object.keys(this.pwa.manifest.protocolHandlers),
      this.desktop.deepLinks.scheme,
    ].map((scheme) => `${scheme}:`);
    return ctx.redirect(pathOf(ctx.search.url, schemes));
  }
}
