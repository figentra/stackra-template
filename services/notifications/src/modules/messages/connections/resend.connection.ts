/**
 * Stackra file contract:
 * Purpose: the `messages.resend` connection: a tenant's own Resend credentials and sender, so its
 *          mail leaves from its own domain instead of the platform's.
 * Boundary: a connection class in `connections/`, bound to ResendIntegration by its first argument;
 *           the key is derived from the file (`messages.resend`). The `@Secret` field names its
 *           secret, `RESEND_TENANT_API_KEY`, a different name from the platform's
 *           `RESEND_API_KEY`: its value is the tenant's own, kept per tenant in the connection
 *           store, encrypted, and never synced by runway, read back to a screen or logged; the
 *           console's settings page for the Resend integration writes it. Without a connection,
 *           the platform's RESEND_API_KEY and the sender from DeliveryConfig apply.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 3, 4, 13, 19 and 20), ADR 0173 (secrets), ADR 0134,
 *                     ADR 0231 (secret names)
 */
import { Secret } from "@stackra/config";
import { Connection } from "@stackra/connections";
import type { Email } from "@stackra/contracts";
import { ResendIntegration } from "#modules/messages/integrations/resend.integration";

/** One per tenant at most; ResendMailTransportDriver looks it up for the current tenant. */
export class ResendConnection extends Connection(ResendIntegration) {
  /** The tenant's Resend API key; write-only from the console. */
  @Secret("RESEND_TENANT_API_KEY")
  apiKey!: string;

  /** The verified From address on the tenant's own domain. */
  fromAddress!: Email;
}
