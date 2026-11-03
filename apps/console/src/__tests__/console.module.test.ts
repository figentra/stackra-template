/**
 * Stackra file contract:
 * Purpose: proves the root module of @figentra/acme-console sits where gen looks for it, `src/<name>.module.ts`,
 *          extends the Module kind base and imports no module yet.
 * Boundary: imports the module file and reads the kind registry; builds no container.
 * Runtime: node
 * Governing contract: ADR 0294 (rule R12); ADR 0022 (test placement).
 */
import { kindOf } from "@stackra/container";
import { describe, expect, it } from "@stackra/testing";

import { ConsoleModule } from "#src/console.module";

/** The console's root module. */
describe(ConsoleModule, () => {
  /** A module kind with no imports yet. */
  it("is a module that imports no module yet", () => {
    expect(kindOf(ConsoleModule)).toEqual({ kind: "module", options: { imports: [] } });
  });
});
