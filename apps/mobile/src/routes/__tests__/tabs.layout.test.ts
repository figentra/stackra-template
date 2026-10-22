/**
 * Stackra file contract:
 * Purpose: the shell's guard redirects to sign-in without a session (keeping the deep link to
 *          resume) and lets a signed-in actor through.
 * Boundary: unit tier; `runGuard` runs the body with a faked session.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0206
 */
import { fakeSession } from "@stackra/identity/testing";
import { runGuard } from "@stackra/navigation/testing";
import { describe, expect, it } from "@stackra/testing";
import { SessionStatus } from "@stackra/identity";
import { SignInRoute } from "#src/routes/sign-in.route";
import { TabsLayout } from "#src/routes/tabs.layout";

/** The one behaviour the layout carries. */
describe("TabsLayout.guard", () => {
  /** Signed out: redirect, with `resume` so the original link replays after sign-in. */
  it("redirects to SignInRoute without a session", async () => {
    const result = await runGuard(TabsLayout, {
      session: fakeSession({ status: SessionStatus.SignedOut }),
    });
    expect(result).toEqual({ redirect: SignInRoute, params: { resume: true } });
  });

  /** Signed in: no redirect; child routes still check their own `permission`. */
  it("passes a signed-in actor", async () => {
    expect(
      await runGuard(TabsLayout, { session: fakeSession({ status: SessionStatus.SignedIn }) }),
    ).toBeUndefined();
  });
});
