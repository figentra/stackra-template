/**
 * Stackra file contract:
 * Purpose: the first tables of the loyalty kit, `loyalty_kit.loyalty_accounts` and
 *          `loyalty_kit.ledger_entries`, with every column and `@Index` the models declared at the
 *          time.
 * Boundary: written by `stackra db diff` from `loyalty_kit.loyalty_account` and
 *           `loyalty_kit.ledger_entry`, reviewed, then committed and never edited. It changes only
 *           the kit's own Postgres schema (`loyalty_kit`); the table constants carry the qualified
 *           names, and gen creates the schema before the first migration. `t.tenant()` adds the
 *           row-level security policy. The entries' account column is nullable here (expand); its
 *           index is 0002, built concurrently, and the NOT NULL lands in a later contract step
 *           after the backfill job. Forward only: there is no `down()`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13 and 20), ADR 0159 (as amended: expand and contract),
 *                     ADR 0239, ADR 0231 (index and key names)
 */
import { type Blueprint, Migration } from "@stackra/database";
import { LedgerEntries, LoyaltyAccounts } from "#stackra/tables";
import { EntryKind } from "#contracts/enums/entry-kind.enum";
import { LoyaltyTier } from "#contracts/enums/loyalty-tier.enum";

/** Two tables; the unique indexes are what make enrolment and appends idempotent. */
export class CreateLoyaltyTablesMigration extends Migration {
  /** Creates the accounts (one live account per tenant and principal) and the ledger entries. */
  up(schema: Blueprint): void {
    schema.create(LoyaltyAccounts, (t) => {
      t.publicId("lac");
      t.tenant();
      t.timestamps();
      t.versioned();
      t.softDeletes();
      t.string(LoyaltyAccounts.columns.memberId, 64);
      t.enum(LoyaltyAccounts.columns.tier, LoyaltyTier).default(LoyaltyTier.Bronze);
      t.boolean(LoyaltyAccounts.columns.isFrozen).default(false);
      t.timestamp(LoyaltyAccounts.columns.frozenAt).nullable();
      t.jsonb(LoyaltyAccounts.columns.notes).default({});
      // idx_loyalty_accounts_tenant_id_member_id, unique among live accounts
      t.unique([LoyaltyAccounts.columns.tenantId, LoyaltyAccounts.columns.memberId]).where(
        LoyaltyAccounts.columns.deletedAt,
        null,
      );
    });
    schema.create(LedgerEntries, (t) => {
      t.publicId("lpe");
      t.tenant();
      // fk_ledger_entries_account_id; expand: filled by the backfill job, NOT NULL later. Its
      // index is 0002, built concurrently, so `belongsTo` skips the index it adds by default.
      t.belongsTo(LoyaltyAccounts).nullable().withoutIndex();
      t.string(LedgerEntries.columns.memberId, 64);
      t.integer(LedgerEntries.columns.points);
      t.enum(LedgerEntries.columns.kind, EntryKind);
      t.string(LedgerEntries.columns.reference, 120);
      t.timestamp(LedgerEntries.columns.at);
      // idx_ledger_entries_tenant_id_member_id_reference, unique: one entry per reference
      t.unique([
        LedgerEntries.columns.tenantId,
        LedgerEntries.columns.memberId,
        LedgerEntries.columns.reference,
      ]);
    });
  }
}
