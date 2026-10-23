/**
 * Stackra file contract:
 * Purpose: the `messages.resend` connection: a tenant's own Resend credentials and sender, so its
 *          mail leaves from its own domain instead of the platform's.
 * Boundary: a connection class; the key is derived from the file (`messages.resend`). The `@Secret`
 *           field is a tenant credential: its value lives in the connection store, encrypted, and
 *           is never read back to a screen or a log; the console's settings page for the Resend
 *           integration edits it. Without a connection, the platform's RESEND_API_KEY and the
 *           sender from DeliveryConfig apply.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 6 and 20), ADR 0173 (secrets), ADR 0134
 */
import { Secret } from "@stackra/config";
import { Connection } from "@stackra/connections";
import type { Email } from "@stackra/contracts";

/** One per tenant at most; ResendIntegration references it by class. */
export class ResendConnection extends Connection {
  /** The tenant's Resend API key; write-only from the console. */
  @Secret
  apiKey!: string;

  /** The verified From address on the tenant's own domain. */
  fromAddress!: Email;
}
