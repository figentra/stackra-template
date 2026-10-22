/**
 * Stackra file contract:
 * Purpose: the hook a signed-in page uses: the session's user, asserted. The generated navigation
 *          never mounts an `auth: true` route signed out, so a signed-out state here is a
 *          programming error, not a runtime state.
 * Boundary: context access only; the one hook of this provider folder.
 * Runtime: react-native
 * Governing contract: ADR 0206, ADR 0232
 */
import { useSession, type SignedInSession } from "@stackra/identity/react";
import { SessionStatus } from "@stackra/identity";
import { SessionRequiredError } from "#src/errors/session-required.error";

/**
 * The signed-in session.
 * @throws SessionRequiredError when a route that declares `auth: false` renders a page that reads
 *          it.
 */
export function useRequireSession(): SignedInSession {
  const session = useSession();
  if (session.status !== SessionStatus.SignedIn) throw new SessionRequiredError();
  return session;
}
