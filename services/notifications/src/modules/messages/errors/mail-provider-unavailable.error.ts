/**
 * Stackra file contract:
 * Purpose: the refusal when the mail provider cannot take a message now.
 * Boundary: a typed AppError, retryable so the queue redelivers the command.
 * Runtime: isomorphic
 * Governing contract: ADR 0140, ADR 0232, guides/programming-model.mdx#errors
 */
import { AppError, ErrorCategory } from "@stackra/errors";

/** `unavailable` / `mail_provider_unavailable`; retryable. */
export class MailProviderUnavailableError extends AppError {
  constructor(reason?: string) {
    super({
      category: ErrorCategory.Unavailable,
      code: "mail_provider_unavailable",
      retryable: true,
      details: { provider: "resend", reason },
    });
  }
}
