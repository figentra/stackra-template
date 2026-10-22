/**
 * Stackra file contract:
 * Purpose: `InboundMailPayload`: the fields of the provider's inbound-mail event the receiver
 *          reads, including the sender-authentication results.
 * Boundary: one schema class and its inferred type (ADR 0006). @stackra/webhooks parses the
 *           verified body with it, so the receiver never sees an unverified or malformed payload.
 * Runtime: isomorphic
 * Governing contract: ADR 0095; safeguards a and b of webhooks/inbound-mail.webhook.ts
 */
import { Schema, z } from "@stackra/schema";
import { MailAuthResult } from "#modules/messages/enums/mail-auth-result.enum";

/** The bare sender address, subject, plain text and the DKIM and SPF results. */
export class InboundMailPayload extends Schema(
  z.object({
    fromAddress: z.email(),
    subject: z.string(),
    text: z.string(),
    authentication: z.object({ dkim: MailAuthResult.schema, spf: MailAuthResult.schema }),
  }),
) {}
