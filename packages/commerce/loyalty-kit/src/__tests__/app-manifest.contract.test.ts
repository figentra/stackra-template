/**
 * Stackra file contract:
 * Purpose: proves the kit's committed `.stackra/app-manifest.json` only adds to the last release:
 *          no removed action, event, permission or hook point, no narrowed input, no renamed
 *          refusal code, and the v1 event upcast stays until its sunset.
 * Boundary: contract tier; reads files only, boots nothing. Helpers come from @stackra/gen/testing,
 *           which owns the manifest.
 * Runtime: node
 * Governing contract: ADR 0158 (the manifest is the contract, committed under `.stackra/`), 0131
 *                     (deprecation), 0260
 */
import { describe, it } from "@stackra/testing";
import { expectBackwardCompatible, loadManifest, previousRelease } from "@stackra/gen/testing";
import { LoyaltyKitModule } from "@acme/loyalty-kit/node";

/**
 * Guards the module's published manifest contract so a release cannot silently break hosts built on
 * the last one.
 */
describe(LoyaltyKitModule, () => {
  /** The diff against the last published manifest is the whole test; any removal fails it. */
  it("only adds to the last release", async () => {
    expectBackwardCompatible(
      await previousRelease("@acme/loyalty-kit"),
      await loadManifest("./.stackra/app-manifest.json"),
    );
  });
});
