/**
 * Stackra file contract:
 * Purpose: builds StockLevel rows for tests and seeders.
 * Boundary: bound to StockLevel by the type argument (`Factory<StockLevel>`). The variant is
 *           catalogue's public id, so the default is a random `var_…` id; a caller passes a real
 *           one when a test must reserve it or a page must show its stock.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 11, 13 and 16), ADR 0190 (factories with states)
 */
import { Factory, type Faker } from "@stackra/database/testing";
import type { Attributes } from "@stackra/model";
import type { StockLevel } from "#modules/inventory/models/stock-level.model";

/**
 * Ten units at the main location, nothing reserved.
 *
 * @example
 * await StockLevelFactory.new().create({ variantId: variant.id, onHand: 50 });
 * await StockLevelFactory.new().soldOut().create({ variantId: variant.id });
 */
export class StockLevelFactory extends Factory<StockLevel> {
  /** The default attributes of one level; tests override what they assert on. */
  definition(faker: Faker): Attributes<StockLevel> {
    return { variantId: faker.publicId("var"), locationId: "loc_main", onHand: 10 };
  }

  /** Nothing on hand and nothing reserved. */
  soldOut(): this {
    return this.state({ onHand: 0, reserved: 0 });
  }
}
