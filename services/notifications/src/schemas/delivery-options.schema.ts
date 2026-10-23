/**
 * Stackra file contract:
 * Purpose: `DeliveryOptions`: the shape of DeliveryConfig: which mail transport sends, the platform
 *          sender, and the Web Push private key by reference.
 * Boundary: a shape class in the member's schemas/ folder, one declaration per file: the property
 *           types are the rules, the initializers the defaults, and gen compiles it to
 *           `DeliveryConfig$`. `@Secret("NAME")` marks a field the runtime secret store resolves
 *           blind; the name is the address, never a value (ADR 0173). The platform's Resend key is
 *           not here: it is `ResendIntegration.apiKey`, so the platform path and a tenant's own
 *           connection share one managed client, its limits and its retries.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 17, 19 and 26, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0146 (config layers), ADR 0173 (secrets), ADR 0266,
 *                     ADR 0223 (web push)
 */
import { Secret } from "@stackra/config";
import type { DriverName } from "@stackra/container";
import type { Email } from "@stackra/contracts";
import type { MailTransport } from "@stackra/notifications/contracts";
import { Schema } from "@stackra/validation";

/** Runway sets `transport: resend` in staging and production. */
export class DeliveryOptions extends Schema {
  /** The MailTransport driver: `memory` keeps mails for dev and tests, `resend` sends them. */
  transport: DriverName<MailTransport> = "memory";

  /** The platform From address, used when a tenant has no Resend connection of its own. */
  fromAddress: Email = "orders@acme.example";

  /**
   * The VAPID private key Web Push messages are signed with (RFC 8292); it never leaves this
   * service. The console subscribes with the public half, its `VITE_WEB_PUSH_VAPID_PUBLIC_KEY`.
   */
  @Secret("WEB_PUSH_VAPID_PRIVATE_KEY")
  webPushVapidPrivateKey!: string;
}
