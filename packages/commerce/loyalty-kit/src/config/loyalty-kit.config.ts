/**
 * Stackra file contract:
 * Purpose: package defaults of the loyalty kit's configuration (the first layer: package → host →
 *          environment → runway).
 * Boundary: a config class: the property types are the rules, the initializers the defaults, and
 *           gen compiles them to `LoyaltyKitConfig$`, which hosts extend. The key is the package
 *           key (`loyalty_kit`), because the file is named after the package. Values only; never
 *           per tenant (that is settings). The ledger driver is a `DriverName<LoyaltyLedger>`
 *           field (runway `config.loyalty_kit.ledger` is its per-environment layer); a custom
 *           driver class is a host `@Replaces(LoyaltyLedger)`. `LoyaltyMembers` has no field: a
 *           port with one candidate needs no selector.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 19 and 20), ADR 0146 (config layers), ADR 0263
 */
import { Config } from "@stackra/config";
import type { DriverName } from "@stackra/container";
import { Int, Num } from "@stackra/validation";
import type { LoyaltyLedger } from "#contracts/ports/loyalty-ledger.port";

/**
 * Injected by type: `constructor(private readonly config: LoyaltyKitConfig)`. A host overrides
 * values in its own `src/config/loyalty-kit.config.ts` with a `<Host>LoyaltyKitConfig` subclass;
 * `STACKRA_LOYALTY_KIT__*` environment variables and runway layer on top. Validated once at boot.
 */
export class LoyaltyKitConfig extends Config {
  /** Which ledger driver runs; names are the driver file prefixes, so a typo is a type error. */
  ledger: DriverName<LoyaltyLedger> = "postgres";

  /**
   * Named instances for a host that runs two ledgers while migrating drivers, each injected as
   * `Named<LoyaltyLedger, "primary">`; empty by default, a host sets them in its override.
   */
  ledgers: Record<string, DriverName<LoyaltyLedger>> = {};

  /** Minor units one point is worth at redemption: one cent by default. */
  @Int({ min: 1 })
  pointValueMinor = 1;

  /** Points earned per minor unit spent, floored: one point per 100 cents by default. */
  @Num({ exclusiveMin: 0 })
  earnPerMinor = 0.01;

  /** Largest share of an order total points may cover, as a whole percentage. */
  @Int({
    min: 0,
    max: 100,
  })
  maxRedeemPercent = 50;
}
