/**
 * Stackra file contract:
 * Purpose: `LoyaltyKitOptions`: the shape of the loyalty kit's configuration: field types are the
 *          rules, initializers the package defaults.
 * Boundary: a shape class, the `schema` of LoyaltyKitConfig; isomorphic, so it ships from the `.`
 *           entry beside the config class. Deploy-time values only; anything a tenant tunes is a
 *           setting. The ledger driver is a `DriverName<LoyaltyLedger>` field, so a typo is a type
 *           error; `LoyaltyMembers` has no field, because a port with one candidate needs no
 *           selector.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 19 and 26), ADR 0146 (config layers, as amended by
 *                     programming model v3.1, AGENTS.md), ADR 0263
 */
import type { DriverName } from "@stackra/container";
import { Int, Num, Schema } from "@stackra/validation";
import type { LoyaltyLedger } from "#contracts/ports/loyalty-ledger.port";

/** Every option the kit reads; a host changes values in its config override, never here. */
export class LoyaltyKitOptions extends Schema {
  /** Which ledger driver runs; names are the driver file prefixes (`postgres`, `memory`). */
  ledger: DriverName<LoyaltyLedger> = "postgres";

  /**
   * Named instances for a host that runs two ledgers while migrating drivers, each injected as
   * `Named<LoyaltyLedger, "primary">`; empty by default.
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
