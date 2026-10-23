/**
 * Stackra file contract:
 * Purpose: the first tables of the orders module, `orders.orders` and `orders.order_lines`, with
 *          every column and index the models declared at the time.
 * Boundary: a frozen snapshot, written by `stackra db diff` from `orders.order` and
 *           `orders.order_line`, reviewed, then never edited once on main: it imports only
 *           @stackra/database, and every table name, column name and enum value is a literal, so a
 *           later model change can never rewrite it (`stackra db check` replays the history and
 *           diffs it against the models). Table names are relative to the module's Postgres schema
 *           (`orders`); gen creates the schema before the module's first migration. The partner
 *           macros write the columns of the trait or field type they are named after
 *           (`hasPublicId`, `belongsToTenant`, `timestamps`, `userStamps`, `versioned`, `money`),
 *           and gen fails if their output differs from the models. Indexes on tables created here
 *           build inside the one transaction (additive: lock 3 s, statement 30 s). No `down()`: gen
 *           derives the dev inverse; production is forward only.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 20 and 27, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0159 (as amended), ADR 0239 (tenant isolation),
 *                     ADR 0231 (index and key names)
 */
import { type Blueprint, Migration, type SchemaBuilder } from "@stackra/database";

/** `paid_at` is not here: it arrived later as an expand step (0002). */
export class CreateOrdersMigration extends Migration {
  /** Creates both tables, the customer index and the expiry job's status index. */
  up(schema: SchemaBuilder): void {
    schema.create("orders", (t: Blueprint) => {
      t.hasPublicId("ord");
      t.belongsToTenant();
      t.timestamps();
      t.userStamps();
      t.versioned();
      t.string("customer_id", 30);
      t.enum("status", ["pending_payment", "paid", "cancelled", "expired"]).default(
        "pending_payment",
      );
      t.money("subtotal");
      t.jsonb("adjustments").default([]);
      t.money("total");
      t.string("payment_id", 64).nullable();
      t.index(["customer_id"]);
      t.index(["tenant_id", "status", "created_at"]);
    });
    schema.create("order_lines", (t: Blueprint) => {
      t.hasPublicId("oln");
      t.belongsToTenant();
      t.belongsTo("orders", { column: "order_id" }).cascadeOnDelete();
      t.link("variant_id");
      t.integer("quantity");
      t.money("unit_price");
    });
  }
}
