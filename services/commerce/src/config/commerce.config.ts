/**
 * Stackra file contract:
 * Purpose: deploy-time configuration of the commerce service; read by operators, applied by a
 *          restart.
 * Boundary: a config class: the property types are the rules, the initializers the defaults, and
 *           gen compiles them to the schema (no Zod here). The key is the member key (`commerce`),
 *           because the file is named after the member. Never per tenant (that is settings). The
 *           secret is a reference resolved blind by the runtime secret store. Layers, lowest first:
 *           these defaults, the environment (`@Env`), then runway.yaml
 *           `environments.<env>.config.commerce`. A required field with no value in some
 *           environment fails `stackra validate`; a missing secret fails the boot.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 6, 19 and 20), ADR 0146 (config layers), ADR 0173
 *                     (secrets), ADR 0296 (runway config values)
 */
import { Config, Env, Secret } from "@stackra/config";
import type { Url } from "@stackra/contracts";
import type { CurrencyCode } from "@stackra/money";
import { Int } from "@stackra/validation";

/** Injected by type: `constructor(private readonly config: CommerceConfig)`. */
export class CommerceConfig extends Config {
  /** Minutes an order may stay pending; tenants may lower it in settings, never raise it. */
  @Int({ min: 5 })
  maxPendingMinutes = 60;

  /** ISO 4217 code used when a market does not name one. */
  defaultCurrency: CurrencyCode = "USD";

  /** Base URL the confirmation mail links to (`<base>/orders/<id>`); set per environment. */
  @Env("STACKRA_STOREFRONT_BASE_URL")
  storefrontBaseUrl!: Url;

  /** API key the pricing client's RPC driver presents; a reference, resolved blind. */
  @Secret("PRICING_API_KEY")
  pricingApiKey!: string;
}
