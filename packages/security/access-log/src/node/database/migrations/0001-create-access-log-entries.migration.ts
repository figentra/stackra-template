/**
 * Stackra file contract:
 * Purpose: the first table of the access-log package, `access_log.access_log_entries`, and the
 *          database-level guard that keeps it append-only.
 * Boundary: written by `stackra db diff`, reviewed, frozen once on main. A snapshot: it imports
 *           only @stackra/database and every name is a literal, so a later model change can never
 *           rewrite it. Table names are relative to the package's Postgres schema (`access_log`),
 *           which gen creates first. Column conventions are partner macros: `hasPublicId`
 *           (@stackra/model), `belongsToTenant` (@stackra/tenancy: tenant column, index and forced
 *           equality policy), `searchable` (@stackra/search) and this package's own
 *           `dataClassification`. The trigger is raw SQL added by hand before the first commit,
 *           because no blueprint operation states "no UPDATE": each `schema.sql` carries its
 *           `inverse`, which is the only hand-written down a migration has; gen derives the rest of
 *           the dev inverse, and production is forward only. The trigger's names are qualified by
 *           the package's own schema, which gen verifies.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13 and 20), ADR 0159 (as amended by programming model
 *                     v3.1, AGENTS.md: snapshots, partner macros, `schema.sql` with `inverse`),
 *                     ADR 0134, ADR 0221, ADR 0239, ADR 0231 (index and key names)
 */
import { type Blueprint, Migration, type SchemaBuilder } from "@stackra/database";

/** One table; the unique (tenant, call id) index is what makes the sink idempotent. */
export class CreateAccessLogEntriesMigration extends Migration {
  /** Creates the table with its RLS policy, its indexes, and the trigger that refuses an UPDATE. */
  up(schema: SchemaBuilder): void {
    schema.create("access_log_entries", (t: Blueprint) => {
      t.hasPublicId("acl");
      t.belongsToTenant();
      t.string("call_id", 64);
      t.string("target", 200);
      t.dataClassification("classification");
      t.jsonb("actor");
      t.jsonb("subjects");
      t.timestamp("at").index(); // idx_access_log_entries_at
      t.searchable({ text: ["target"], filters: ["classification"] });
      t.index(["search_vector"]).using("gin");
      t.index(["tenant_id", "classification"]);
      // idx_access_log_entries_tenant_id_call_id, unique
      t.unique(["tenant_id", "call_id"]);
    });
    schema.sql(
      `create function access_log.refuse_update() returns trigger language plpgsql as $$
begin
  raise exception 'access_log.access_log_entries is append-only';
end $$`,
      { inverse: "drop function access_log.refuse_update()" },
    );
    schema.sql(
      `create trigger trg_access_log_entries_refuse_update before update on
access_log.access_log_entries for each row execute function access_log.refuse_update()`,
      {
        inverse:
          "drop trigger trg_access_log_entries_refuse_update on access_log.access_log_entries",
      },
    );
  }
}
