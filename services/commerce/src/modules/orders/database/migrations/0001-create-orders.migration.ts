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
      t.string("customer_id", 30)
        .notNull()
        .comment("The customer principal who placed it; set from the actor, never from input.");
      t.enum("status", ["pending_payment", "paid", "cancelled", "expired"])
        .notNull()
        .default("pending_payment")
        .comment(
          "Lifecycle; written only by OrderStateMachine. The initializer is the initial state.",
        );
      t.money("subtotal").notNull().comment("Sum of line prices before adjustments.");
      t.jsonb("adjustments")
        .notNull()
        .default([])
        .comment(
          "What the `adjustTotals` extensions applied at placement, in the order they ran; jsonb.",
        );
      t.money("total").notNull().comment("Amount charged, never below zero.");
      t.string("payment_id", 64)
        .nullable()
        .comment("The payments service's id once a payment is authorized.");
      t.index(["customer_id"]);
      t.index(["tenant_id", "status", "created_at"]);
    });
    schema.create("order_lines", (t: Blueprint) => {
      t.hasPublicId("oln");
      t.belongsToTenant();
      t.belongsTo("orders", { column: "order_id" })
        .notNull()
        .cascadeOnDelete()
        .comment(
          "The owning order; foreign key `fk_order_lines_order_id`, deleted with the order.",
        );
      t.link("variant_id").notNull().comment("The catalogue variant sold.");
      t.integer("quantity").notNull().comment("Units ordered; at least one.");
      t.money("unit_price").notNull().comment("Price of one unit at placement.");
    });
  }
}
