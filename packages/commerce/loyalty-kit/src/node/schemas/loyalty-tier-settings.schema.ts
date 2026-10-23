/**
 * Stackra file contract:
 * Purpose: `LoyaltyTierSettings`: the tiers section of LoyaltyKitSettings: the balances at which an
 *          account is promoted.
 * Boundary: a shape class; as the type of a settings field it becomes a section (one card on the
 *           settings page, keys `loyalty_kit.tiers.<field>`, labels
 *           `loyalty_kit::settings.tiers.<field>.label`). Its initializers are the section's
 *           defaults, so the settings field that holds it has none. Sections are one level deep.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4 and 26), ADR 0108 and ADR 0213 (settings, as amended
 *                     by programming model v3.1, AGENTS.md)
 */
import { Setting } from "@stackra/settings";
import { Int, Schema } from "@stackra/validation";

/** Promotion thresholds in whole points; demotion is never automatic. */
export class LoyaltyTierSettings extends Schema {
  /** Balance at which an account becomes silver. */
  @Int({ min: 0 })
  silverFrom = 1_000;

  /** Balance at which an account becomes gold; the platform may lock it for franchise tenants. */
  @Int({ min: 0 })
  @Setting({ lockable: true })
  goldFrom = 5_000;
}
