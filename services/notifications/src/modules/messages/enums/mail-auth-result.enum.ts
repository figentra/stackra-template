/**
 * Stackra file contract:
 * Purpose: the outcome of one sender-authentication check (DKIM or SPF) on an inbound mail, as the
 *          provider reports it.
 * Boundary: a house enum (class); codes are the RFC 8601 result names in snake_case. The inbound
 *           webhook acts only on `pass` for both checks (ADR 0207 safeguard b).
 * Runtime: isomorphic
 * Governing contract: ADR 0128 (amended), ADR 0231, ADR 0207
 */
import { Enum } from "@stackra/schema";
import { I18n } from "#stackra/i18n";

/** The result of a DKIM or SPF check on an inbound mail. */
export class MailAuthResult extends Enum<MailAuthResult> {
  /** The check succeeded; the only result that lets a mail act for a customer. */
  static readonly Pass = MailAuthResult.case("pass", { label: I18n.messages.mail_auth.pass });
  /** The check failed outright. */
  static readonly Fail = MailAuthResult.case("fail", { label: I18n.messages.mail_auth.fail });
  /** SPF soft failure: probably not authorised. */
  static readonly SoftFail = MailAuthResult.case("soft_fail", {
    label: I18n.messages.mail_auth.soft_fail,
  });
  /** The domain publishes no usable policy, so nothing was proven. */
  static readonly None = MailAuthResult.case("none", { label: I18n.messages.mail_auth.none });
}
