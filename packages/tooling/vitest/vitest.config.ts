/**
 * Stackra file contract:
 * Purpose: test config of @stackra/vitest-config: the `tooling` role it ships (plain Node, explicit vitest
 *          imports, an empty suite fails), imported by relative path because a package cannot depend on
 *          itself.
 * Boundary: the preset's own tests only; it adds nothing to the role.
 * Runtime: node
 * Governing contract: Stackra ADR 0022 (test placement)
 */
import { tooling } from "./src/factories.ts";

export default tooling;
