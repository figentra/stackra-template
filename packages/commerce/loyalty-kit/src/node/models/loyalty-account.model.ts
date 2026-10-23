/**
 * Stackra file contract:
 * Purpose: a member's loyalty account: tier, status and the entries that make up the balance.
 * Boundary: data, relations and indexes. Key `loyalty_kit.loyalty_account`, table
 *           `loyalty_kit.loyalty_accounts` (the kit's Postgres schema), public ids `lac_…`. Tier
 *           and status move only through AccountService; recorded events reach the outbox when the
 *           unit of work flushes. The member id is the host principal's public id, whatever its
 *           prefix, so it stays a bounded string. Every index is an `@Index` here, so `stackra db
 *           diff` never proposes dropping one. No constructor-made state.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 11, 20 and 27), ADR 0133 (traits), ADR 0239
 *                     (BelongsToTenant)
 */
import { Collection, Index, Model, OneToMany } from "@stackra/model";
import {
  BelongsToTenant,
  HasPublicId,
  SoftDeletes,
  Timestamps,
  Versioned,
} from "@stackra/model/traits";
import { Str } from "@stackra/validation";
import { LoyaltyTier } from "#contracts/enums/loyalty-tier.enum";
import { LedgerEntry } from "#node/models/ledger-entry.model";
import type { AccountNotes } from "#node/schemas/account-notes.schema";

/**
 * One account per (tenant, principal). The traits give the row its public id, the tenant column
 * with row-level security, timestamps, an optimistic version and a soft delete; the kit never
 * hard-deletes an account because its entries are an audit record.
 */
@Index(["tenantId", "memberId"], {
  unique: true,
  where: "deleted_at is null",
})
export class LoyaltyAccount extends Model.with(
  HasPublicId("lac"),
  BelongsToTenant,
  Timestamps,
  Versioned,
  SoftDeletes,
) {
  /** The host principal's public id; unique per tenant among live accounts. */
  @Str({ max: 64 })
  memberId!: string;

  /** Current tier; raised by RecalculateTierListener after an earn, chosen only at enrolment. */
  tier: LoyaltyTier = LoyaltyTier.Bronze;

  /** Frozen accounts earn and redeem nothing until staff unfreeze them. */
  isFrozen = false;

  /** When the account was frozen; null while active. */
  frozenAt: Date | null = null;

  /** Merchant notes; jsonb. */
  notes: AccountNotes = {};

  /** The ledger rows; loaded on demand with `populate: ["entries"]`. */
  @OneToMany(() => LedgerEntry, (entry) => entry.account)
  entries = new Collection<LedgerEntry>(this);

  /** Whether points may move; the single rule every action checks before touching the ledger. */
  get canTransact(): boolean {
    return !this.isFrozen;
  }
}
