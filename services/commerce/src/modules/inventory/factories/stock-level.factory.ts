/**
 * Stackra file contract:
 * Purpose: builds StockLevel rows for tests and seeds.
 * Boundary: the variant id is a public id of catalogue; callers pass a real one when a test must
 *           reserve it.
 * Runtime: node
 * Governing contract: ADR 0190, guides/programming-model.mdx#factories
 */
import { Factory, type Faker } from "@stackra/database/testing";
import { StockLevel } from "#modules/inventory/models/stock-level.model";

/** Ten units at the main location, nothing reserved. */
export class StockLevelFactory extends Factory<StockLevel> {
  /** The model this factory builds. */
  model = StockLevel;

  /** The default attributes of one record; tests override what they assert on. */
  protected definition(faker: Faker): Partial<StockLevel> {
    return {
      variantId: `var_${faker.string.alphanumeric({ length: 26, casing: "lower" })}`,
      locationId: "loc_main",
      onHand: 10,
      reserved: 0,
    };
  }

  /** Named states; `.state(name)` merges one on top of the definition. */
  protected states = {
    soldOut: (): Partial<StockLevel> => ({ onHand: 0, reserved: 0 }),
  };
}
