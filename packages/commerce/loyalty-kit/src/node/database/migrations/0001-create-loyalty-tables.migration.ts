/**
 * Stackra file contract:
 * Purpose: the kit's first tables, `loyalty_kit.loyalty_accounts` and `loyalty_kit.ledger_entries`,
 *          with the search columns of the account's `@Searchable` facet.
 * Boundary: written by `stackra db diff`, reviewed, frozen once on main. A snapshot, not a view of
 *           today's models: it imports only @stackra/database, and every table, column and enum
 *           value is a literal, so a later model change can never rewrite it. Table names are
 *           relative to the module's Postgres schema (`loyalty_kit`), which gen creates first.
 *           Column conventions are partner macros named after what they write: `hasPublicId`,
 *           `timestamps`, `versioned`, `softDeletes` (the @stackra/model traits), `belongsToTenant`
 *           (@stackra/tenancy: the tenant column, its index and the forced equality policy) and
 *           `searchable` (@stackra/search: the weighted tsvector of the text fields). Using the
 *           tenancy and search macros orders this file after those packages' migrations, with no
 *           `after:`. Every column the file names states its nullability (`notNull()` or
 *           `nullable()`) and carries `comment(...)`, the model field's docblock, as its Postgres
 *           COMMENT; a macro comments the columns it writes. Indexes on tables created here build
 *           inside the transaction. The entries' account column is nullable (expand); its index is
 *           0002, built online. No `down()`: gen derives the dev inverse; production is forward
 *           only.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13 and 20), ADR 0159 (as amended by programming model
 *                     v3.1, AGENTS.md: snapshots, partner macros, generated inverse), ADR 0221,
 *                     ADR 0239, ADR 0231 (index and key names)
 */
import { type Blueprint, Migration, type SchemaBuilder } from "@stackra/database";

/** Two tables; the unique indexes make enrolment and appends idempotent. */
export class CreateLoyaltyTablesMigration extends Migration {
  /** Creates the accounts (one live account per tenant and principal) and the ledger entries. */
  up(schema: SchemaBuilder): void {
    schema.create("loyalty_accounts", (t: Blueprint) => {
      t.hasPublicId("lac");
      t.belongsToTenant();
      t.timestamps();
      t.versioned();
      t.softDeletes();
      t.string("member_id", 64)
        .notNull()
        .comment(
          "The host principal's public id; unique per tenant among live accounts; pseudonymous.",
        );
      t.enum("tier", ["bronze", "silver", "gold"])
        .notNull()
        .default("bronze")
        .comment(
          "Current tier; raised by RecalculateTierListener after an earn, chosen only at enrolment.",
        );
      t.boolean("is_frozen")
        .notNull()
        .default(false)
        .comment("Frozen accounts earn and redeem nothing until staff unfreeze them.");
      t.timestamp("frozen_at")
        .nullable()
        .comment("When the account was frozen; null while active.");
      t.jsonb("notes").notNull().default({}).comment("Merchant notes; jsonb.");
      t.searchable({ text: ["member_id"], filters: ["tier", "is_frozen", "created_at"] });
      // idx_loyalty_accounts_search_vector and the filter indexes the resource sorts and filters on
      t.index(["search_vector"]).using("gin");
      t.index(["tenant_id", "tier"]);
      t.index(["tenant_id", "is_frozen"]);
      t.index(["tenant_id", "created_at"]);
      // idx_loyalty_accounts_tenant_id_member_id, unique among live accounts
      t.unique(["tenant_id", "member_id"]).where("deleted_at is null");
    });
    schema.create("ledger_entries", (t: Blueprint) => {
      t.hasPublicId("lpe");
      t.belongsToTenant();
      // fk_ledger_entries_account_id; expand: filled by the backfill job, NOT NULL in a later
      // contract step; its index is 0002, so the foreign key skips the default one
      t.belongsTo("loyalty_accounts", { column: "account_id" })
        .nullable()
        .withoutIndex()
        .comment(
          "The owning account. Null while the expand step runs; a later contract step makes it required.",
        );
      t.string("member_id", 64)
        .notNull()
        .comment(
          "The principal the points belong to; denormalised from the account for the unique index.",
        );
      t.integer("points")
        .notNull()
        .comment(
          "Points moved: positive earns, negative redeems; bounded by MAX_POINTS_PER_ENTRY either way.",
        );
      t.enum("kind", ["earn", "redeem", "expire", "adjust", "hold", "release"])
        .notNull()
        .comment("Why the row exists.");
      t.string("reference", 120)
        .notNull()
        .comment("The cause (an order id, a campaign id); unique per tenant and member.");
      t.timestamp("at").notNull().comment("When the cause happened, as the caller reported it.");
      // idx_ledger_entries_tenant_id_member_id_reference, unique: one entry per reference
      t.unique(["tenant_id", "member_id", "reference"]);
    });
  }
}
