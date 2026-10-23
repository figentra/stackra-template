/**
 * Stackra file contract:
 * Purpose: the refusal when the actor has no inbox entry with the given id.
 * Boundary: a refusal class: kind `NotFound`, code derived from the class name
 *           (`notification_not_found`). Another principal's entry is the same refusal, so its
 *           existence never leaks (ADR 0140).
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 16 and 20), ADR 0140 (envelope and kinds), ADR 0232
 */
import type { PublicId } from "@stackra/contracts";
import { ErrorKind, Refusal } from "@stackra/errors";

/** Not retryable. */
export class NotificationNotFoundError extends Refusal({
  kind: ErrorKind.NotFound,
  retryable: false,
}) {
  /** The entry the caller asked for. */
  notificationId!: PublicId<"ntf">;
}
