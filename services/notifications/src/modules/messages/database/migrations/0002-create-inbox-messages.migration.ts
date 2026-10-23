/**
 * Stackra file contract:
 * Purpose: the in-app inbox table of the messages module, `messages.inbox_messages`.
 * Boundary: a frozen snapshot written by `stackra db diff` from `messages.inbox_message`, reviewed,
 *           then never edited once on main; literals only. The recipient is a principal's public id
 *           in `varchar(30)`. Additive: a new table and its index in one transaction. No `down()`:
 *           gen derives the dev inverse.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 20 and 27, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0159 (as amended), ADR 0231 (index and key names)
 */
import { type Blueprint, Migration, type SchemaBuilder } from "@stackra/database";

/** The per-principal, newest-first index is the one the inbox query reads. */
export class CreateInboxMessagesMigration extends Migration {
  /** Creates the table and its index. */
  up(schema: SchemaBuilder): void {
    schema.create("inbox_messages", (t: Blueprint) => {
      t.hasPublicId("inm");
      t.belongsToTenant();
      t.timestamps();
      t.string("principal_id", 30);
      t.enum("kind", ["order_paid"]);
      t.jsonb("data");
      t.timestamp("read_at").nullable();
      t.index(["tenant_id", "principal_id", "created_at"]);
    });
  }
}
