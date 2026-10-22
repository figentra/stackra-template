/**
 * Stackra file contract:
 * Purpose: test config of @stackra/tsdown-config: the `tooling` role of the vitest presets (plain Node,
 *          explicit vitest imports, an empty suite fails).
 * Boundary: the preset's own tests only; it adds nothing to the role.
 * Runtime: node
 * Governing contract: Stackra ADR 0022 (test placement)
 */
import { tooling } from "@stackra/vitest-config";

export default tooling;
