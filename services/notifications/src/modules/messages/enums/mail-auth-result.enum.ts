/**
 * Stackra file contract:
 * Purpose: the outcome of one sender-authentication check (DKIM or SPF) on an inbound mail, as the
 *          provider reports it.
 * Boundary: an `Enum.of` value plus the type of the same name; codes are the RFC 8601 result names
 *           in snake_case. CancelFromMailListener acts only on `pass` for both checks (its
 *           safeguard b). Labels are the derived i18n keys
 *           `messages::enums.mail_auth_result.<code>`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 16 and 20), ADR 0231 (snake_case codes)
 */
import { Enum } from "@stackra/validation";

/** `pass` is the only result that lets a mail act for a customer. */
export const MailAuthResult = Enum.of({
  Pass: "pass",
  Fail: "fail",
  SoftFail: "soft_fail",
  None: "none",
});

/** One of the codes above. */
export type MailAuthResult = Enum.Value<typeof MailAuthResult>;
