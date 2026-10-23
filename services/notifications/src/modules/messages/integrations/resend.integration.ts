/**
 * Stackra file contract:
 * Purpose: the `messages.resend` integration: Resend as the tenant-facing mail provider, listed in
 *          the console's integrations settings (a generated page) with its connection form.
 * Boundary: an integration class; the key (`messages.resend`) and the label
 *           (`messages::integrations.resend.label`) are derived from the file. It names the
 *           connection it needs; sending stays in ResendMailTransportDriver, so this class only
 *           makes the provider visible and configurable per tenant.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 11 and 20), ADR 0142 (transport behind a port)
 */
import { Integration, IntegrationCategory } from "@stackra/integrations";
import { ResendConnection } from "#modules/messages/connections/resend.connection";

/** Shown under "Email" in the console; connecting it switches the tenant's mail to its own key. */
export class ResendIntegration extends Integration({
  category: IntegrationCategory.Email,
  connection: () => ResendConnection,
}) {}
