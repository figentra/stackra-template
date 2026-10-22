/**
 * Stackra file contract:
 * Purpose: proves a signed-in visitor is redirected to `returnTo` (in-app paths only; an absolute
 *          URL falls back to `/`), and a visitor without a session is sent to the BFF login with
 *          `returnTo` encoded.
 * Boundary: unit tier; `runRouteLoader` calls the class's loader with a fake RouteContext (session,
 *           search, identity).
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0241, ADR 0007
 */
import { describe, expect, it } from "@stackra/testing";
import { runRouteLoader } from "@stackra/testing/react";
import { SessionStatus } from "@stackra/identity";
import { SignInRoute } from "#src/routes/sign-in.route";

/** Guards the sign-in entry, which handles redirects from untrusted input. */
describe(SignInRoute, () => {
  /**
   * An open redirect through `returnTo` must be impossible: anything not an in-app path becomes
   * `/`.
   */
  it("bounces a signed-in visitor to an in-app returnTo only", async () => {
    const result = await runRouteLoader(SignInRoute, {
      session: { status: SessionStatus.SignedIn },
      search: { returnTo: "https://evil.example" },
    });
    expect(result.redirect).toBe("/");
  });

  /**
   * An unauthenticated visitor must go to the BFF login and come back to where they were headed.
   */
  it("sends a visitor without a session to the BFF login", async () => {
    const result = await runRouteLoader(SignInRoute, {
      session: null,
      search: { returnTo: "/settings" },
    });
    expect(result.navigations).toEqual([
      { to: "/api/auth/login?returnTo=%2Fsettings", external: true },
    ]);
  });
});
