/**
 * Stackra file contract:
 * Purpose: the loyalty kit's configuration class: the first layer of package → host → environment
 *          → runway.
 * Boundary: the class is the DI token and its key is derived from the file name (`loyalty_kit`).
 *           `schema` names the shape (LoyaltyKitOptions: fields, types, defaults); `env` maps the
 *           one field read from the environment to its variable. Values only; never per tenant
 *           (that is settings) and never a secret. A custom ledger class is a host
 *           `@Replaces(LoyaltyLedger)`; runway `config.loyalty_kit.ledger` is the per-environment
 *           layer of the driver choice. A second override of this class, or a second class with
 *           the key, fails gen.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 19 and 20), ADR 0146 (config layers, as amended by
 *                     programming model v3.1, AGENTS.md), ADR 0263
 */
import { Config } from "@stackra/config";
import { LoyaltyKitOptions } from "#core/schemas/loyalty-kit-options.schema";

/**
 * Injected by type: `constructor(private readonly config: LoyaltyKitConfig)`. A host overrides
 * values in its own `src/config/loyalty-kit.config.ts`, under the same name with the package class
 * aliased:
 *
 * @example
 * ```ts
 * import { LoyaltyKitConfig as BaseLoyaltyKitConfig } from "@acme/loyalty-kit";
 *
 * export class LoyaltyKitConfig extends BaseLoyaltyKitConfig {
 *   override maxRedeemPercent = 30;
 * }
 * ```
 */
export class LoyaltyKitConfig extends Config({
  schema: LoyaltyKitOptions,
  env: { ledger: "STACKRA_LOYALTY_KIT_LEDGER" },
}) {
  // `declare`: types only; the value and its default stay in LoyaltyKitOptions, so the layers
  // (package → host → environment → runway) keep one source.

  /** Minor units one point is worth at redemption; default 1 (one cent). */
  declare readonly pointValueMinor: LoyaltyKitOptions["pointValueMinor"];

  /** Points earned per minor unit spent, floored; default 0.01 (one point per 100 cents). */
  declare readonly earnPerMinor: LoyaltyKitOptions["earnPerMinor"];

  /** Largest share of an order total points may cover, as a whole percentage; default 50. */
  declare readonly maxRedeemPercent: LoyaltyKitOptions["maxRedeemPercent"];
}
