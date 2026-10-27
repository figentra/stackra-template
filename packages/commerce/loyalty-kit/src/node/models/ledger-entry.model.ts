/**
 * Stackra file contract:
 * Purpose: the persisted points ledger row the postgres driver writes through the journal.
 * Boundary: data, relations and indexes. Key `loyalty_kit.ledger_entry`, table
 *           `loyalty_kit.ledger_entries` (the kit's Postgres schema, so no prefix is needed against
 *           a host's own tables), public ids `lpe_…`. Append-only by trait: corrections are new
 *           entries, never updates. A unique index on (tenant, member, reference) makes appends
 *           idempotent. The account is the one relation inside the module; gen indexes it.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 11, 20 and 27), ADR 0159, ADR 0239 (tenant column and
 *                     row-level security)
 */
import { AppendOnly, HasPublicId, Index, ManyToOne, Model, type Ref } from "@stackra/model";
import { BelongsToTenant } from "@stackra/tenancy/node";
import { Int, Str } from "@stackra/validation";
import type { EntryKind } from "#contracts/enums/entry-kind.enum";
import { MAX_POINTS_PER_ENTRY } from "#core/constants/max-points-per-entry.constant";
import { LoyaltyAccount } from "#node/models/loyalty-account.model";

/** One ledger entry as a row. */
@Index(["tenantId", "memberId", "reference"], { unique: true })
export class LedgerEntry extends Model.with(HasPublicId("lpe"), BelongsToTenant, AppendOnly) {
  /**
   * The owning account; foreign key `fk_ledger_entries_account_id`. Null while the expand step
   * runs (the backfill job fills it); a later contract step makes it required.
   */
  @ManyToOne(() => LoyaltyAccount)
  account: Ref<LoyaltyAccount> | null = null;

  /** The principal the points belong to; denormalised from the account for the unique index. */
  @Str({ max: 64 })
  memberId!: string;

  /** Points moved: positive earns, negative redeems; bounded by MAX_POINTS_PER_ENTRY either way. */
  @Int({
    min: -MAX_POINTS_PER_ENTRY,
    max: MAX_POINTS_PER_ENTRY,
  })
  points!: number;

  /** Why the row exists. */
  kind!: EntryKind;

  /** The cause (an order id, a campaign id); unique per tenant and member. */
  @Str({ max: 120 })
  reference!: string;

  /** When the cause happened, as the caller reported it. */
  at!: Date;
}
