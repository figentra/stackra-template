/**
 * Stackra file contract:
 * Purpose: the first table of the messages module, `messages.messages`, with every column and index
 *          the model declared at the time.
 * Boundary: a frozen snapshot written by `stackra db diff` from `messages.message`, reviewed, then
 *           never edited once on main: it imports only @stackra/database, and table names, column
 *           names and enum values are literals. The table name is relative to the module's Postgres
 *           schema (`messages`). The recipient is a principal's public id in `varchar(30)`, never
 *           an address. The partner macros write the trait columns. Additive: one transaction. No
 *           `down()`: gen derives the dev inverse.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 20 and 27, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0159 (as amended), ADR 0231 (index and key names),
 *                     ADR 0134
 */
import { type Blueprint, Migration, type SchemaBuilder } from "@stackra/database";

/** The dedup row of every queued call; the body is never a column. */
export class CreateMessagesMigration extends Migration {
  /** Creates the table with the command-key dedup index. */
  up(schema: SchemaBuilder): void {
    schema.create("messages", (t: Blueprint) => {
      t.hasPublicId("msg");
      t.belongsToTenant();
      t.timestamps();
      t.string("command_key", 128);
      t.string("principal_id", 30);
      t.string("mail", 64);
      t.string("subject", 200);
      t.enum("status", ["queued", "sent", "failed"]).default("queued");
      t.string("provider_id", 128).nullable();
      t.timestamp("sent_at").nullable();
      t.unique(["tenant_id", "command_key"]);
    });
  }
}
