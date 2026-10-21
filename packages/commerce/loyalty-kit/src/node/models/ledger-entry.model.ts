/**
 * Stackra file contract:
 * Purpose: the persisted points ledger row the postgres driver writes; the package's module
 *          contributes its migration.
 * Boundary: append-only; a unique index on (tenant, member, reference) makes appends idempotent.
 *           The belongs-to to the account is the one relation inside this module. The table name is
 *           declared because the derived `ledger_entries` could collide with a host table;
 *           `appendOnly` makes update and delete a gen error.
 * Runtime: node
 * Governing contract: ADR 0097, 0159, 0239 (tenant column + RLS)
 */
import { BelongsTo, DateTime, Enumerated, Index, Int, Model, Nullable, Str } from "@stackra/model";
import { BelongsToTenant, HasPublicId } from "@stackra/model/traits";
import { EntryKind } from "#core/enums/entry-kind.enum";
import { MAX_POINTS_PER_ENTRY } from "#core/constants/max-points-per-entry.constant";
import { LoyaltyAccount } from "#node/models/loyalty-account.model";

/** One ledger entry as a row (`lpe_…`). Corrections are new entries, never updates. */
@Model({ table: "loyalty_ledger_entries", appendOnly: true })
@Index<LedgerEntry>(["tenantId", "memberId", "reference"], { unique: true })
@Index<LedgerEntry>(["account"])
export class LedgerEntry extends Model.with(HasPublicId("lpe"), BelongsToTenant) {
  /**
   * The owning account; `fk_loyalty_ledger_entries_account` in the migration. Nullable while the
   * expand step runs (the backfill job fills it); the contract step removes `@Nullable` and adds
   * the NOT NULL in a later release.
   */
  @Nullable() @BelongsTo(() => LoyaltyAccount) account!: LoyaltyAccount | null;
  /**
   * The principal public id the points belong to; denormalised from the account for the unique
   * index.
   */
  @Str({ max: 64 }) memberId!: string;
  /**
   * Points moved: positive earns, negative redeems; bounded by {@link MAX_POINTS_PER_ENTRY} either
   * way.
   */
  @Int({ min: -MAX_POINTS_PER_ENTRY, max: MAX_POINTS_PER_ENTRY }) points!: number;
  /** Why the row exists. */
  @Enumerated(EntryKind) kind!: EntryKind;
  /** The cause (order id, campaign id); unique per tenant and member. */
  @Str({ max: 120 }) reference!: string;
  /** When the cause happened, as the caller reported it. */
  @DateTime() at!: Date;
}
