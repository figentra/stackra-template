/**
 * Stackra file contract:
 * Purpose: `PurgeAccessLogOutput`: the output of the `access_log.entry.purge@1` job: how many
 *          records one run deleted.
 * Boundary: a shape class in its own file; zero is normal on a quiet day.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 13 and 26, as amended by programming model v3.1,
 *                     AGENTS.md)
 */
import { Int, Schema } from "@stackra/validation";

/** Records deleted by one run. */
export class PurgeAccessLogOutput extends Schema {
  /** How many records the run deleted. */
  @Int({ min: 0 })
  deleted!: number;
}
