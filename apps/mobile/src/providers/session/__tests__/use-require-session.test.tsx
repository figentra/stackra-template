/**
 * Stackra file contract:
 * Purpose: the hook returns the user when signed in and throws the typed refusal (never renders
 *          half a page) when a route mounted it without a session.
 * Boundary: unit tier; the session fake sets the state.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0232
 */
import { fakeSession } from "@stackra/identity/testing";
import { describe, expect, it } from "@stackra/testing";
import { renderHook } from "@stackra/testing/native";
import { SessionStatus } from "@stackra/identity";
import { SessionRequiredError } from "#src/errors/session-required.error";
import { useRequireSession } from "#src/providers/session";

/** The assertion hook. */
describe("useRequireSession", () => {
  /** Signed in: the user. */
  it("returns the signed-in user", () => {
    const session = fakeSession({ status: SessionStatus.SignedIn });
    const { result } = renderHook(() => useRequireSession(), { session });
    expect(result.current.user.userId).toBe(session.user.userId);
  });

  /** Signed out: a programming error, surfaced as the typed `session_required` refusal. */
  it("throws SessionRequiredError when mounted signed out", () => {
    expect(() =>
      renderHook(() => useRequireSession(), {
        session: fakeSession({ status: SessionStatus.SignedOut }),
      }),
    ).toThrow(SessionRequiredError);
  });
});
