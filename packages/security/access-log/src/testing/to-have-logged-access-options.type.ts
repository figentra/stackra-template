/**
 * Stackra file contract:
 * Purpose: `ToHaveLoggedAccessOptions`: what `expect(sink).toHaveLoggedAccess(...)` looks for.
 * Boundary: a type in its own file beside the matcher (one declaration per file), exported from
 *           the ./testing entry only, because only tests build it.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 2, 8 and 15, as amended by programming model v3.1,
 *                     AGENTS.md), ADR 0269
 */

/** Every given field must match one record. */
export interface ToHaveLoggedAccessOptions {
  /** The `<Class>.<method>` the record must name. */
  readonly target: string;

  /** Record ids that must all appear among the record's subjects. */
  readonly subjects?: readonly string[];

  /** The public id the record's actor must carry. */
  readonly actorId?: string;
}
