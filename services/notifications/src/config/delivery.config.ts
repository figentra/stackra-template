/**
 * Stackra file contract:
 * Purpose: deploy-time configuration of how the notifications service delivers: the mail transport,
 *          the platform sender and the Web Push key.
 * Boundary: `Config({ schema })`: the shape is DeliveryOptions (src/schemas/) and the class is the
 *           DI token. No field is read from an environment variable (runway sets `transport` per
 *           environment under `config."notifications.delivery"`), so there is no `env` map. The key
 *           is `notifications.delivery` (`<member>.<snake(stem)>`); the member key alone,
 *           `notifications`, stays free for the @stackra/notifications package config that the root
 *           runway's defaults set in every service. Never per tenant: a tenant's own sender is a
 *           Resend connection. `transport` picks one of this service's MailTransport drivers by
 *           name, the one home of that choice (ADR 0266).
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 17, 19 and 20, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0146 (config layers), ADR 0173 (secrets), ADR 0266
 */
import { Config } from "@stackra/config";
import { DeliveryOptions } from "#src/schemas/delivery-options.schema";

/** Injected by type wherever delivery reads its transport choice or sender. */
export class DeliveryConfig extends Config({ schema: DeliveryOptions }) {}
