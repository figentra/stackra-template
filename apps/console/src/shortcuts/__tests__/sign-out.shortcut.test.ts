/**
 * Stackra file contract:
 * Purpose: proves signing out hands off to the BFF's logout with a full navigation.
 * Boundary: unit tier; `runShortcut` runs the class with the identity fake and records navigations.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0241, ADR 0007
 */
import { runShortcut } from "@stackra/shortcuts/testing";
import { describe, expect, it } from "@stackra/testing";
import { SignOutShortcut } from "#src/shortcuts/sign-out.shortcut";

/** Guards the one way out of a session. */
describe(SignOutShortcut, () => {
  /**
   * The cookie is HttpOnly, so only the BFF can clear it: the shortcut must hand off with a full
   * navigation.
   */
  it("navigates to the BFF logout with a full navigation", async () => {
    const { navigations } = await runShortcut(SignOutShortcut);
    expect(navigations).toEqual([{ to: "/api/auth/logout", external: true }]);
  });
});
