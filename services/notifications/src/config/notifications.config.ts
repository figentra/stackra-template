/**
 * Stackra file contract:
 * Purpose: deploy-time configuration of the notifications service: which mail transport, the
 *          platform sender, two secrets by reference.
 * Boundary: a config class; never per tenant (a tenant's own sender is a Resend connection); secret
 *           values never appear here (ADR 0173). `transport` selects among this service's own
 *           MailTransport drivers, the one home of that choice (ADR 0266).
 * Runtime: node
 * Governing contract: ADR 0146, 0173, 0231 d4 (secret names are `<PROVIDER>_<PURPOSE>`),
 *                     guides/programming-model.mdx#config-files, ADR 0266
 */
import { Config, DriverOf, Secret } from "@stackra/config";
import type { DriverName } from "@stackra/container";
import { Email } from "@stackra/validation";
import { MailTransport } from "#modules/messages/contracts/mail-transport.port";

/** Injected by type; runway.yaml sets `transport: resend` in staging and production. */
@Config("notifications.service")
export class NotificationsConfig {
  /**
   * Which registered MailTransport driver sends: `memory` keeps mails for dev and tests, `resend`
   * is production.
   * @defaultValue "memory"
   */
  @DriverOf(MailTransport) transport: DriverName<MailTransport> = "memory";
  /**
   * The platform From address, used when a tenant has no Resend connection of its own.
   * @defaultValue "orders@example.test"
   */
  @Email() fromAddress = "orders@example.test";
  /** The platform's Resend API key; a reference resolved blind by the secret store. Required. */
  @Secret("RESEND_API_KEY") resendApiKey!: string;
  /** Secret the inbound-mail receiver verifies Standard Webhooks signatures with. Required. */
  @Secret("RESEND_INBOUND_SIGNING_SECRET") inboundSigningSecret!: string;
}
