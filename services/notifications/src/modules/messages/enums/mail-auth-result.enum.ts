/**
 * Stackra file contract:
 * Purpose: the outcome of one sender-authentication check (SPF, DKIM or DMARC) on an inbound mail,
 *          as Resend's receiving server reports it.
 * Boundary: an `Enum.of` value plus the type of the same name; the codes are Resend's result names
 *           (snake_case). `gray` covers a missing, soft-failing or neutral result.
 *           CancelFromMailListener acts only on `pass` for both DKIM and SPF (its safeguard b).
 *           Labels are the derived i18n keys `messages::enums.mail_auth_result.<code>`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 16 and 20), ADR 0231 (snake_case codes)
 */
import { Enum } from "@stackra/validation";

/** `pass` is the only result that lets a mail act for a customer. */
export const MailAuthResult = Enum.of({
  Pass: "pass",
  Fail: "fail",
  Gray: "gray",
  ProcessingFailed: "processing_failed",
  Unknown: "unknown",
});

/** One of the codes above. */
export type MailAuthResult = Enum.Value<typeof MailAuthResult>;
