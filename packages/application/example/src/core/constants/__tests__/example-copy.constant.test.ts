/**
 * Stackra file contract:
 * Purpose: unit tests of `EXAMPLE_COPY`: each surface's text names the package that draws it, and the copy is frozen.
 * Boundary: test only.
 * Runtime: node
 * Governing contract: ADR 0022 (test placement); ADR 0441 (decision 3: surfaces load packages).
 */
import { describe, expect, it } from "@stackra/testing";

import { EXAMPLE_COPY } from "#src/core/constants/example-copy.constant";

/** The text the console page and the mobile screen show. */
describe("EXAMPLE_COPY", () => {
  /** A reader of either surface can tell which package drew it. */
  it("names the package on the console page and the mobile screen", () => {
    expect(EXAMPLE_COPY.console).toContain("@figentra/acme-example");
    expect(EXAMPLE_COPY.mobile).toContain("@figentra/acme-example");
  });

  /** A shell cannot change the text another surface reads. */
  it("is frozen", () => {
    expect(Object.isFrozen(EXAMPLE_COPY)).toBe(true);
  });
});
