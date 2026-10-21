/**
 * Stackra file contract:
 * Purpose: the hard ceiling on one ledger movement, shared by the schemas, the ledger model and the
 *          resource form.
 * Boundary: a module-level constant (SCREAMING_SNAKE, ADR 0231 decision 1); one declaration per
 *           file (ADR 0006). `constants/` would appear with its second file (ADR 0130 d2); the
 *           catalogue shows the folder with one.
 * Runtime: isomorphic
 * Governing contract: ADR 0231, ADR 0006, ADR 0130
 */

/**
 * Largest absolute number of points one entry may move; a bigger movement is a schema refusal, not
 * a clamp.
 */
export const MAX_POINTS_PER_ENTRY = 1_000_000;
