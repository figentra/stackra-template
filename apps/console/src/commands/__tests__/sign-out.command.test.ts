/**
 * Stackra file contract:
 * Purpose: proves sign-out leaves the app for the BFF's logout URL instead of clearing anything
 *          itself.
 * Boundary: unit tier; `runCommand` records navigations and the identity fake answers `logoutUrl`.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0241, ADR 0007
 */
import { runCommand } from "@stackra/kbd/testing";
import { describe, expect, it } from "@stackra/testing";
import { SignOutCommand } from "#src/commands/sign-out.command";

/** Guards the one way out of a session. */
describe(SignOutCommand, () => {
  /**
   * The cookie is HttpOnly, so only the BFF can clear it: the command must hand off with a full
   * navigation.
   */
  it("navigates to the BFF logout with a full navigation", async () => {
    const { navigations } = await runCommand(SignOutCommand);
    expect(navigations).toEqual([{ to: "/api/auth/logout", external: true }]);
  });
});
