/**
 * Stackra file contract:
 * Purpose: the `messages.resend` connection: a tenant's own Resend credentials and sender, so its
 *          mail leaves from its own domain instead of the platform's.
 * Boundary: a declaration (`@Connection`, @stackra/connections). Credential values live in the
 *           connection store, encrypted, and are never read back to a screen or a log; the console
 *           settings page for the Resend integration edits them. Without one, the platform's
 *           RESEND_API_KEY and sender from NotificationsConfig apply.
 * Runtime: node
 * Governing contract: ADR 0173 (secrets), ADR 0134; ADR 0127
 */
import { Connection, Credential } from "@stackra/connections";
import { Email } from "@stackra/validation";

/** One per tenant at most; the Resend integration references it by class. */
@Connection({ key: "resend" })
export class ResendConnection {
  /** The tenant's Resend API key; write-only from the console. */
  @Credential() apiKey!: string;
  /** The verified From address on the tenant's own domain. */
  @Email() fromAddress!: string;
}
