/**
 * Stackra file contract:
 * Purpose: a member's loyalty account: tier, status and the entries that make up the balance.
 * Boundary: data, invariants and recorded events; status moves only through AccountService. Shows
 *           every field shape a model carries: scalar fields, an enum column, a JSON cast, traits
 *           by mixin, a has-many relation, a getter. Key `loyalty_kit.loyalty_account` and table
 *           `loyalty_accounts` are derived from the class name. Every index is declared here, so
 *           `stackra db diff` never proposes dropping one.
 * Runtime: node
 * Governing contract: ADR 0095 (fields), 0133 (traits), 0134 (classification), 0239 (tenancy)
 */
import {
  Bool,
  Classified,
  DateTime,
  Enumerated,
  HasMany,
  Index,
  Json,
  Model,
  Nullable,
  Str,
} from "@stackra/model";
import {
  BelongsToTenant,
  HasPublicId,
  SoftDeletes,
  Timestamps,
  Versioned,
} from "@stackra/model/traits";
import { LoyaltyTier } from "#core/enums/loyalty-tier.enum";
import { AccountNotes } from "#node/schemas/account-notes.schema";
import { LedgerEntry } from "#node/models/ledger-entry.model";

/**
 * One account per (tenant, principal). The traits give the row its public id (`lac_…`), tenant
 * column with row-level security, timestamps, an optimistic version and a soft delete; the kit
 * never hard-deletes an account because its entries are an audit record. Recorded events
 * (`account.record(...)`) reach the outbox when the unit of work flushes.
 */
@Model()
@Index<LoyaltyAccount>(["tenantId", "memberId"], { unique: true, where: "deleted_at is null" })
export class LoyaltyAccount extends Model.with(
  HasPublicId("lac"),
  BelongsToTenant,
  Timestamps,
  Versioned,
  SoftDeletes,
) {
  /**
   * The host principal's public id; unique per tenant among live accounts (the `@Index` above).
   * Personal only by linkage, so `pseudonymous`.
   */
  @Classified("pseudonymous") @Str({ max: 64 }) memberId!: string;
  /**
   * Current tier; raised by RecalculateTierListener after each earn, never set by hand except at
   * enrolment.
   */
  @Enumerated(LoyaltyTier) tier!: LoyaltyTier;
  /** Frozen accounts earn and redeem nothing until staff unfreeze them. */
  @Bool() isFrozen!: boolean;
  /** When the account was frozen; null while active. */
  @Nullable() @DateTime() frozenAt!: Date | null;
  /** Merchant notes; a JSON cast validated by {@link AccountNotes} on write and parsed on read. */
  @Json(AccountNotes.schema) notes!: AccountNotes;
  /** The ledger rows; loaded on demand with `populate: ["entries"]`. */
  @HasMany(() => LedgerEntry, (entry) => entry.account) entries!: LedgerEntry[];

  /** Whether points may move; the single rule every action checks before touching the ledger. */
  get canTransact(): boolean {
    return !this.isFrozen;
  }
}
