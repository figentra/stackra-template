/**
 * Stackra file contract:
 * Purpose: `PromotionMessageSettings`: the "News and offers" section of a person's notification
 *          preferences.
 * Boundary: a shape class in schemas/, one declaration per file, typed as a field of
 *           MessagesSettings, which makes it a section (keys `messages.promotions.<field>`).
 *           Defaults live here only, and both are off until the person opts in. `@Renamed` moves
 *           the stored choices from their old top-level keys.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 6 and 26, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0108, ADR 0213, ADR 0223
 */
import { Setting } from "@stackra/settings";
import { Renamed, Schema } from "@stackra/validation";

/** Opt-in only: nothing promotional reaches a person who did not ask for it. */
export class PromotionMessageSettings extends Schema {
  /** Whether news about products the person bought (restocks, price drops) reaches them. */
  @Setting({ client: true })
  @Renamed("productUpdates")
  productUpdates = false;

  /** Whether promotional messages reach the person. */
  @Setting({ client: true })
  @Renamed("marketing")
  marketing = false;
}
