/**
 * Stackra file contract:
 * Purpose: the inbound mail the provider posts to `/webhooks/inbound-mail`: a customer's reply to a
 *          confirmation, such as "CANCEL <order id>".
 * Boundary: a webhook event: always in the public area, verified with the provider's Standard
 *           Webhooks signature against the secret it names (listed in runway `secrets`) before any
 *           field is parsed, so a bad signature is refused and nothing runs (safeguard a). The
 *           fields are the provider's payload; CancelFromMailListener holds the logic and the other
 *           two safeguards. The provider receives 2xx for every verified mail, so it never retries
 *           one that will never qualify.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 5 and 16), ADR 0082 (areas), ADR 0173 (secret names)
 */
import type { Email } from "@stackra/contracts";
import { WebhookEvent } from "@stackra/events";
import { SignatureScheme } from "@stackra/webhooks";
import type { MailAuthentication } from "#modules/messages/schemas/mail-authentication.schema";

/** The bare sender address, subject, plain text and the DKIM and SPF results. */
export class InboundMailReceived extends WebhookEvent({
  path: "/webhooks/inbound-mail",
  scheme: SignatureScheme.StandardWebhooks,
  secret: "RESEND_INBOUND_SIGNING_SECRET",
}) {
  /** The sender's bare address. */
  fromAddress!: Email;

  /** The subject line. */
  subject!: string;

  /** The plain-text body, where a customer writes `CANCEL <order id>`. */
  text!: string;

  /** The provider's sender-authentication results. */
  authentication!: MailAuthentication;
}
