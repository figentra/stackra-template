/**
 * Stackra file contract:
 * Purpose: the dated API versions this service serves and the default for callers with no pin.
 * Boundary: `Config({ schema })`: the shape is VersioningOptions (src/schemas/); no field is read
 *           from the environment, so there is no `env` map. The key is derived from the member and
 *           the file stem (`commerce.versioning`). Gen also reads it: a dated change whose date is
 *           not listed is a gen error.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 19 and 20, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0118 (dated versions, 12-month support, pinning)
 */
import { Config } from "@stackra/config";
import { VersioningOptions } from "#src/schemas/versioning-options.schema";

/** Injected by type where a response is shaped for a caller's pinned date. */
export class VersioningConfig extends Config({ schema: VersioningOptions }) {}
