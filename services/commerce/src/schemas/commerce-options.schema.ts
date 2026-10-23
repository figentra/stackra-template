/**
 * Stackra file contract:
 * Purpose: `CommerceOptions`: the shape of CommerceConfig: the default currency, the storefront
 *          base URL and the pricing client's API key.
 * Boundary: a shape class in the member's schemas/ folder, one declaration per file: the property
 *           types are the rules, the initializers the defaults, the field decorators the extra
 *           constraints, and gen compiles it to `CommerceConfig$`. `@Secret("NAME")` marks a field
 *           whose value the runtime secret store resolves blind (Infisical, synced by runway); the
 *           name is the address, never a value. Which fields the environment sets is
 *           CommerceConfig's `env` map, not a decorator here. How long an unpaid order may wait is
 *           a setting (`orders.cancellation.*`), not config.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 19 and 26, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0146 (config layers), ADR 0173 (secrets)
 */
import { Secret } from "@stackra/config";
import type { Url } from "@stackra/contracts";
import type { CurrencyCode } from "@stackra/money";
import { Schema } from "@stackra/validation";

/** Deploy-time values of the commerce service; the same for every tenant. */
export class CommerceOptions extends Schema {
  /** ISO 4217 code used when a market does not name one. */
  defaultCurrency: CurrencyCode = "USD";

  /** Base URL the confirmation mail links to (`<base>/orders/<id>`); set per environment. */
  storefrontBaseUrl!: Url;

  /** API key the pricing client's RPC driver presents; a reference, resolved blind. */
  @Secret("PRICING_API_KEY")
  pricingApiKey!: string;
}
