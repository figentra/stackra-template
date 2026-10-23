/**
 * Stackra file contract:
 * Purpose: proves the kit's committed stackra.manifest.json only adds to the last release: no
 *          removed action, event, permission or extension point, no narrowed input, no renamed
 *          refusal code, and the v1 event change stays until its sunset.
 * Boundary: contract tier; reads the committed file at the member root, boots nothing. Helpers come
 *           from @stackra/gen/testing, which owns the manifest. A rename needs `@Renamed`, which
 *           `stackra gen --check` enforces separately.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 10 and 22), ADR 0158, ADR 0131 (deprecation), ADR 0260
 */
import { expectBackwardCompatible, loadManifest, previousRelease } from "@stackra/gen/testing";
import { describe, it } from "@stackra/testing";

/** The committed contract hosts build on. */
describe("stackra.manifest.json", () => {
  /** The manifest published with the last release is the baseline; any removal fails here. */
  it("only adds to the last release", async () => {
    const next = await loadManifest("./stackra.manifest.json");
    const previous = await previousRelease("@acme/loyalty-kit");

    expectBackwardCompatible(previous, next);
  });
});
