/**
 * Stackra file contract:
 * Purpose: package defaults of the loyalty kit's configuration (the first layer: package → host →
 *          env → runway).
 * Boundary: a config class: types from the property declarations, validation from the field
 *           decorators (Zod is the engine inside @stackra/validation and never visible here).
 *           Values only; never per tenant (that is settings). The ledger driver is the one
 *           `@DriverOf` choice for this port (runway `drivers.ledger` is its per-environment
 *           layer); a custom driver class is a host `@Replaces(LoyaltyLedger)`. `LoyaltyMembers`
 *           has no field: a port with one registered driver needs no selector.
 * Runtime: isomorphic
 * Governing contract: ADR 0146 (config layers), ADR 0095 (field rules), ADR 0263 (gen writes the
 *                     wiring)
 */
import { Config, DriverOf } from "@stackra/config";
import type { DriverName } from "@stackra/container";
import { Int, Num } from "@stackra/validation";
import { LoyaltyLedger } from "#contracts/loyalty-ledger.port";

/**
 * Injected by type (no `@Inject`): `constructor(private readonly config: LoyaltyKitConfig)`. A host
 * overrides values in its own `src/config/loyalty-kit.config.ts` with `override(LoyaltyKitConfig,
 * {...})`; `STACKRA_LOYALTY_KIT__*` environment variables and `runway.yaml` layer on top. Validated
 * once at boot.
 */
@Config("loyalty_kit")
export class LoyaltyKitConfig {
  /**
   * Which registered ledger driver runs; a typo is a type error because the names are the
   * `@Driver(LoyaltyLedger, name)` registrations. @defaultValue "postgres"
   */
  @DriverOf(LoyaltyLedger) ledger: DriverName<LoyaltyLedger> = "postgres";
  /**
   * Named instances for a host that runs two ledgers while migrating drivers; each is injected with
   * `@Named("primary")`. Empty by default: a host sets them in its override. @defaultValue {}
   */
  @DriverOf(LoyaltyLedger, { named: { primary: "postgres", archive: "memory" } })
  ledgers: Record<string, DriverName<LoyaltyLedger>> = {};
  /** Minor units one point is worth at redemption. @defaultValue 1 (one cent) */
  @Int({ min: 1 }) pointValueMinor = 1;
  /**
   * Points earned per minor unit spent; the result is floored. @defaultValue 0.01 (one point per
   * 100 cents)
   */
  @Num({ min: 0, exclusiveMin: true }) earnPerMinor = 0.01;
  /** Largest share of an order total points may cover, as a whole percentage. @defaultValue 50 */
  @Int({ min: 0, max: 100 }) maxRedeemPercent = 50;
}
