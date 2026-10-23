/**
 * Stackra file contract:
 * Purpose: the `messages.resend` integration: Resend as the tenant-facing mail provider, listed in
 *          the console's integrations settings (a generated page) with its connection form.
 * Boundary: an integration class in `integrations/`; the key (`messages.resend`) and the label
 *           (`messages::integrations.resend.label`) are derived from the file, and `provider` names
 *           the vendor once. It names no connection: ResendConnection names this class, so the
 *           dependency points from the credentials to the provider. Sending stays in
 *           ResendMailTransportDriver, so this class only makes the provider visible and
 *           configurable per tenant.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 3, 13, 16 and 20), ADR 0142 (transport behind a port)
 */
import { Integration, IntegrationCategory } from "@stackra/integrations";

/** Shown under "Email" in the console; connecting it switches the tenant's mail to its own key. */
export class ResendIntegration extends Integration({
  provider: "resend",
  category: IntegrationCategory.Email,
}) {}
