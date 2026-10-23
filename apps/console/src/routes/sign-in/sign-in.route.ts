/**
 * Stackra file contract:
 * Purpose: `/login`: the hand-off to the hosted login. A signed-in visitor goes back where they
 *          came from; anyone else is sent to the BFF login (ZITADEL's hosted page behind the
 *          central login app). Its page, `sign-in.tsx` beside it, renders only while the redirect
 *          is in flight or was blocked.
 * Boundary: the console never renders a credential field and never sees a token. `returnTo` is an
 *           in-app path only: it is resolved against the console's own origin and anything that
 *           lands elsewhere or normalises to `//host` (`//host`, `/\host`, `/.//host`, an absolute
 *           URL) becomes `/`; the BFF re-validates it. Outside the shell: `PublicLayout`, and
 *           `auth: false` because the route calls nothing a permission could be derived from. The
 *           title reuses the page heading's key.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0241 (central login app, BFF), ADR 0206
 *                     d8
 */
import { Route, type RouteContext } from "@stackra/navigation";
import { I18n } from "#stackra/i18n";
import { PublicLayout } from "#src/routes/public/public.layout";

/**
 * `raw` as a path on the console's own origin. The URL parser decides, not a prefix check: browsers
 * read `/\host` as `//host`, and both leave the origin.
 */
function inAppReturnTo(raw: string | undefined): string {
  if (!raw?.startsWith("/")) return "/";
  try {
    const here = new URL(globalThis.location.href);
    const target = new URL(raw, here);
    // protocol + host, not `origin`: the desktop's `app:` scheme has an opaque origin, and its
    // parser keeps a backslash in the path, which a later hop could still read as `//host`
    const leaves = target.protocol !== here.protocol || target.host !== here.host;
    // dot segments normalise to a path that can still read as `//host`: `/.//host`, `/a/..//host`
    if (leaves || target.pathname.startsWith("//") || target.pathname.includes("\\")) return "/";
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/"; // an unparsable host such as `//[`
  }
}

/** Route `/login`: hand-off to the hosted login; a signed-in visitor goes back where they were. */
export class SignInRoute extends Route({
  path: "/login",
  layout: PublicLayout,
  auth: false,
  title: I18n.pages.login.title,
}) {
  /** `returnTo` defaults to the panel root and never leaves the origin; signed out → the BFF. */
  override async loader(ctx: RouteContext<this>) {
    const returnTo = inAppReturnTo(ctx.search.returnTo);
    if (ctx.session) return ctx.redirect(returnTo);
    const loginUrl = ctx.identity.loginUrl(returnTo); // `<apiOrigin><bffEndpoint>/login?returnTo=…`
    ctx.navigate(loginUrl, { external: true }); // the BFF answers with a 302 to ZITADEL
    return { loginUrl };
  }
}
