/**
 * Stackra file contract:
 * Purpose: the refusal when the mail provider cannot take a message now.
 * Boundary: a refusal class: kind `Unavailable`, code derived from the class name
 *           (`mail_provider_unavailable`), retryable, so the delivery job is retried and finally
 *           dead-lettered. The fields are the envelope's details.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 16 and 20), ADR 0140 (envelope and kinds), ADR 0148,
 *                     ADR 0232
 */
import { ErrorKind, Refusal } from "@stackra/errors";

/** Thrown by the Resend driver on a transport or provider failure. */
export class MailProviderUnavailableError extends Refusal({
  kind: ErrorKind.Unavailable,
  retryable: true,
}) {
  /** The provider that refused. */
  provider = "resend";

  /** The provider's error name, when it gave one. */
  reason?: string;
}
