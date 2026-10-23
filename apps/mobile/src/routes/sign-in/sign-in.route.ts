/**
 * Stackra file contract:
 * Purpose: the only route of the signed-out tree: a welcome panel and one button that opens the
 *          identity provider's hosted sign-in in the system browser (PKCE). There is no credential
 *          field in the app.
 * Boundary: a route class: options only. Every route needs a session by default; `auth: false` puts
 *           this one in the signed-out stack instead. No path, so it is never deep-linked to; no
 *           header. The tabs layout's loader redirects here with `resume`, so the original deep
 *           link is replayed after sign-in. The page is `sign-in.tsx`, bound by name; the title is
 *           `pages::sign_in.title`, read by assistive tech.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0295 (decision 11), ADR 0206
 */
import { HeaderStyle, Route } from "@stackra/navigation";

/** The sign-in screen, reachable only while signed out. */
export class SignInRoute extends Route({
  auth: false,
  chrome: { header: HeaderStyle.Hidden },
}) {}
