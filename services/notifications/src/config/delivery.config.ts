/**
 * Stackra file contract:
 * Purpose: deploy-time configuration of how the notifications service delivers: which mail
 *          transport sends, the platform sender, and two secrets by reference (the platform's
 *          Resend key and the Web Push private key).
 * Boundary: a config class: the property types are the rules, the initializers the defaults, and
 *           gen compiles them to the schema. The key is `notifications.delivery`
 *           (`<member>.<snake(stem)>`); the member key alone, `notifications`, stays free for the
 *           @stackra/notifications package config that the root runway's defaults set in every
 *           service. Never per tenant: a tenant's own sender is a Resend connection. Secret values
 *           never appear here (ADR 0173). `transport` picks one of this service's MailTransport
 *           drivers by name, the one home of that choice (ADR 0266); runway sets it per
 *           environment under `config."notifications.delivery"`. The inbound-mail signing secret is
 *           named by the InboundMailReceived event itself, so it is no field here.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 17, 19 and 20), ADR 0146 (config layers), ADR 0173
 *                     (secrets), ADR 0231 (secret names), ADR 0266, ADR 0223 (web push)
 */
import { Config, Secret } from "@stackra/config";
import type { DriverName } from "@stackra/container";
import type { Email } from "@stackra/contracts";
import type { MailTransport } from "@stackra/notifications/contracts";

/** Injected by type; runway sets `transport: resend` in staging and production. */
export class DeliveryConfig extends Config {
  /** The MailTransport driver: `memory` keeps mails for dev and tests, `resend` sends them. */
  transport: DriverName<MailTransport> = "memory";

  /** The platform From address, used when a tenant has no Resend connection of its own. */
  fromAddress: Email = "orders@acme.example";

  /** The platform's Resend API key; a reference resolved blind by the secret store. */
  @Secret("RESEND_API_KEY")
  resendApiKey!: string;

  /**
   * The VAPID private key Web Push messages are signed with (RFC 8292); it never leaves this
   * service. The console subscribes with the public half, its `VITE_WEB_PUSH_VAPID_PUBLIC_KEY`.
   */
  @Secret("WEB_PUSH_VAPID_PRIVATE_KEY")
  webPushVapidPrivateKey!: string;
}
