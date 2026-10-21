/**
 * Stackra file contract:
 * Purpose: `/login`: the hand-off to the hosted login. A signed-in visitor goes back where they
 *          came from; anyone else is sent to the BFF login (ZITADEL's hosted page behind the
 *          central login app). The page renders only while the redirect is in flight or was
 *          blocked.
 * Boundary: the console never renders a credential field and never sees a token. `returnTo` is an
 *           in-app path only; the BFF re-validates it. Outside the shell: `PublicLayout`, and
 *           `auth: false` because the route calls nothing a permission could be derived from.
 * Runtime: browser
 * Governing contract: ADR 0241 (central login app, BFF), ADR 0206 d8
 */
import { Route, type RouteContext } from "@stackra/navigation";
import { I18n } from "#stackra/i18n";
import { SignInPage } from "#src/components/pages/sign-in";
import { PublicLayout } from "#src/routes/public.layout";

/**
 * Route `/login`: hand-off to the hosted login; a signed-in visitor is sent back where they came
 * from.
 */
@Route({
  path: "/login",
  layout: PublicLayout,
  auth: false,
  component: SignInPage,
  meta: { title: I18n.console.login.title, noindex: true },
})
export class SignInRoute {
  /**
   * `returnTo` defaults to the panel root and is never an absolute URL; signed out goes to the BFF.
   */
  async loader(ctx: RouteContext) {
    const raw = ctx.search.returnTo ?? "/";
    const returnTo = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
    if (ctx.session) return ctx.redirect(returnTo);
    const loginUrl = ctx.identity.loginUrl(returnTo); // `<apiOrigin><bffEndpoint>/login?returnTo=…`
    ctx.navigate(loginUrl, { external: true }); // the BFF answers with a 302 to ZITADEL
    return { loginUrl };
  }
}
