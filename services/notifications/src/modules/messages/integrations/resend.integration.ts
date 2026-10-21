/**
 * Stackra file contract:
 * Purpose: the `messages.resend` integration: Resend as the tenant-facing mail provider, listed in
 *          the console's integrations settings (a generated page) with its connection form.
 * Boundary: a declaration (`@Integration`, @stackra/integrations); it names the connection it needs
 *           and the transport driver it backs. Sending stays in ResendMailTransport; this class
 *           only makes the provider visible and configurable per tenant (one example covers rows 18
 *           and 20 of the coverage table).
 * Runtime: node
 * Governing contract: ADR 0142 (transport behind a port); ADR 0127 rows 18 and 20
 */
import { Integration, IntegrationCategory } from "@stackra/integrations";
import { I18n } from "#stackra/i18n";
import { ResendConnection } from "#modules/messages/connections/resend.connection";

/** Shown under "Email" in the console; connecting it switches the tenant's mail to its own key. */
@Integration({
  key: "resend",
  category: IntegrationCategory.Email,
  label: I18n.messages.integrations.resend,
  connection: ResendConnection,
})
export class ResendIntegration {}
