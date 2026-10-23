/**
 * Stackra file contract:
 * Purpose: the refusal when a member asks for more points than they hold.
 * Boundary: a refusal class: kind `FailedPrecondition` (category `precondition_failed`), code
 *           derived from the class name (`insufficient_points`); the fields are numbers only,
 *           never personal data. The transport status is generated from the kind. The text is
 *           `loyalty_kit::errors.insufficient_points.message`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 16 and 20), ADR 0140 (envelope and kinds), ADR 0232
 */
import { ErrorKind, Refusal } from "@stackra/errors";
import { Int } from "@stackra/validation";

/** Not retryable: the balance changes only by an earn or an adjustment. */
export class InsufficientPointsError extends Refusal({
  kind: ErrorKind.FailedPrecondition,
  retryable: false,
}) {
  /** Points the member holds now. */
  @Int
  balance!: number;

  /** Points the caller asked for. */
  @Int
  requested!: number;
}
