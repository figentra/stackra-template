/**
 * Stackra file contract:
 * Purpose: the only route of the signed-out tree: the brand mark, one line, one button that opens
 *          ZITADEL's hosted sign-in in the system browser (PKCE). There is no credential field in
 *          the app.
 * Boundary: `auth: false` puts it in the signed-out stack; no path (never deep-linked to); no
 *           header. The tabs layout's guard redirects here with `resume`, so the original deep link
 *           is replayed after sign-in.
 * Runtime: react-native
 * Governing contract: ADR 0206
 */
import { Presentation, Route } from "@stackra/navigation";
import { SignInPage } from "#src/components/pages/sign-in";

/** The sign-in screen, reachable only while signed out. */
@Route({
  auth: false,
  presentation: Presentation.Card,
  header: { shown: false },
  component: SignInPage,
})
export class SignInRoute {}
