/**
 * Stackra file contract:
 * Purpose: the `messages.resend` integration: Resend as the tenant's own mail provider, and the
 *          platform's provider when a tenant has none; listed under "Email" in the console's
 *          integrations marketplace.
 * Boundary: an Integration describes the provider once, the same for every tenant: who may hold a
 *           connection (`levels`), how a request authenticates (an API key sent as a bearer
 *           header), the base URL the managed client joins paths to, Resend's documented rate limit
 *           (ten requests per second per team, one bucket per key actually used), retries (a POST
 *           retries only with the provider's idempotency header), the scheduled health check, and
 *           how inbound webhooks are verified and routed (Svix-signed Standard Webhooks, the event
 *           type at the payload's `type`, each type a `WebhookEvent<ResendIntegration>` class). A
 *           `{field}` placeholder resolves on the tenant's ResendConnection first, then on this
 *           class, so a tenant's own key and webhook secret win over the platform's with no second
 *           mechanism. The `@Secret` fields here are platform secrets (Infisical, synced by runway,
 *           listed in runway.yaml); the connection's are tenant secrets in the connection store.
 *           Gen derives the key (`messages.resend`), labels, logo, the `messages.resend.*`
 *           permissions, the webhook path and the egress allowlist, and locks them in the manifest.
 *           Sending stays in ResendMailTransportDriver.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 3, 13, 16 and 20, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0107, ADR 0218, ADR 0224 (webhooks), ADR 0173 (secrets)
 */
import { Secret } from "@stackra/config";
import {
  AuthType,
  ConnectionLevel,
  Integration,
  IntegrationCategory,
  RateLimitScope,
} from "@stackra/integrations";
import { SignatureScheme } from "@stackra/webhooks";

/** On every plan; connecting it switches the tenant's mail to its own key and domain. */
export class ResendIntegration extends Integration({
  provider: "resend",
  category: IntegrationCategory.Email,
  levels: [ConnectionLevel.Tenant],
  auth: {
    type: AuthType.ApiKey,
    header: "Authorization",
    format: "Bearer {apiKey}",
  },
  baseUrl: "https://api.resend.com",
  rateLimits: [
    {
      requests: 10,
      per: "1s",
      by: RateLimitScope.Credential,
    },
  ],
  retry: { idempotencyHeader: "Idempotency-Key" },
  health: {
    every: "6h",
    failAfter: 3,
  },
  webhooks: {
    scheme: SignatureScheme.StandardWebhooks,
    secret: "{webhookSecret}",
    eventType: { path: "type" },
  },
  listing: { docsUrl: "https://resend.com/docs" },
}) {
  /** The platform's API key, used when the tenant has no connection; never logged. */
  @Secret("RESEND_API_KEY")
  apiKey!: string;

  /**
   * The signing secret of the webhooks Resend posts for the platform's own account, among them the
   * inbound replies to the platform's confirmations; a tenant connection carries its own.
   */
  @Secret("RESEND_WEBHOOK_SECRET")
  webhookSecret!: string;
}
