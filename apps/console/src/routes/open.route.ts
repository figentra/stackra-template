/**
 * Stackra file contract:
 * Purpose: `/open`: where an outside link lands. The PWA protocol handler (`web+acme://…`) and the
 *          desktop deep link (`acme-console://…`) both open `/open?url=<link>`; the route turns the
 *          link into the in-app path it names and redirects there inside the shell.
 * Boundary: only the schemes the console registers are accepted (pwa.config.ts
 *           `manifest.protocolHandlers`, desktop.config.ts `deepLinks.scheme`); a foreign scheme,
 *           a link that would leave the origin (`//host`, a backslash) or an unparsable one goes to
 *           `/`. The shell's guard runs first, so a signed-out user signs in and comes back here.
 * Runtime: browser
 * Governing contract: ADR 0255 (PWA manifest), ADR 0254 (desktop deep links), ADR 0241
 */
import { Route, type RouteContext } from "@stackra/navigation";
import { DesktopConfig } from "#src/config/desktop.config";
import { PwaConfig } from "#src/config/pwa.config";
import { ShellLayout } from "#src/routes/shell.layout";

/**
 * `acme-console://orders/orders/ord_1` → `/orders/orders/ord_1`. A custom scheme parses its first
 * segment as the host, so the path is host + pathname.
 */
function pathOf(raw: string | undefined, schemes: readonly string[]): string {
  if (!raw) return "/";
  try {
    const link = new URL(raw);
    if (!schemes.includes(link.protocol)) return "/";
    const path = `/${link.host}${link.pathname}`.replace(/(?<=.)\/+$/, "");
    if (path.startsWith("//") || path.includes("\\")) return "/";
    return `${path}${link.search}${link.hash}`;
  } catch {
    return "/"; // not a URL at all
  }
}

/** Route `/open`: resolves an outside link to an in-app path; it never renders. */
@Route({ path: "/open", layout: ShellLayout })
export class OpenRoute {
  /** Redirects to the linked path, or the panel root when the link is not one of ours. */
  async loader(ctx: RouteContext) {
    const schemes = [
      ...Object.keys(ctx.config(PwaConfig).manifest.protocolHandlers),
      ctx.config(DesktopConfig).deepLinks.scheme,
    ].map((scheme) => `${scheme}:`);
    return ctx.redirect(pathOf(ctx.search.url, schemes));
  }
}
