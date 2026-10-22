/**
 * Stackra file contract:
 * Purpose: proves a signed-in visitor is redirected to `returnTo` (in-app paths only; an absolute
 *          URL, a protocol-relative `//host`, the backslash form `/\host` and a dot-segment path that
 *          normalises to `//host` all fall back to `/`),
 *          and a visitor without a session is sent to the BFF login with `returnTo` encoded.
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
   * An open redirect through `returnTo` must be impossible: every form a browser resolves to
   * another host or normalises to `//host` becomes `/`, including the forms a prefix check misses.
   */
  it.each([
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/\t/evil.example",
    // stays on the origin when parsed, but dot segments normalise the path to `//evil.example`
    "/.//evil.example",
    "/..//evil.example",
    "/a/..//evil.example",
    "/%2e%2e//evil.example",
    "/./\\evil.example",
  ])("sends a signed-in visitor to / instead of %j", async (returnTo) => {
    const result = await runRouteLoader(SignInRoute, {
      session: { status: SessionStatus.SignedIn },
      search: { returnTo },
    });
    expect(result.redirect).toBe("/");
  });

  /** An in-app path keeps its query and fragment, so the visitor lands on the exact view. */
  it("sends a signed-in visitor back to an in-app returnTo", async () => {
    const result = await runRouteLoader(SignInRoute, {
      session: { status: SessionStatus.SignedIn },
      search: { returnTo: "/settings?tab=device#pending-changes" },
    });
    expect(result.redirect).toBe("/settings?tab=device#pending-changes");
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
