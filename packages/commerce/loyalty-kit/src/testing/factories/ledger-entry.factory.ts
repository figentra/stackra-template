/**
 * Stackra file contract:
 * Purpose: builds LedgerEntry rows under an account, for the seeder and the postgres driver's
 *          fixtures.
 * Boundary: a model factory (MikroORM through @stackra/database/testing); the account comes from
 *           `.for()` or `.has()`.
 * Runtime: node
 * Governing contract: ADR 0190, ADR 0269
 */
import { Factory, type Faker } from "@stackra/database/testing";
import { EntryKind } from "#core/enums/entry-kind.enum";
import { LedgerEntry } from "#node/models/ledger-entry.model";
import { LoyaltyAccountFactory } from "#testing/factories/loyalty-account.factory";

/**
 * `new LoyaltyAccountFactory(em).has(LedgerEntryFactory, 3).createOne()` gives an account with
 * three earns.
 */
export class LedgerEntryFactory extends Factory<LedgerEntry> {
  /** The model this factory builds. */
  model = LedgerEntry;

  /**
   * A 100-point earn with a unique order reference; `memberId` is copied from the parent account by
   * `.for()`.
   */
  protected definition(faker: Faker): Partial<LedgerEntry> {
    const account = this.belongsTo(LoyaltyAccountFactory);
    return {
      account,
      memberId: account.memberId,
      points: 100,
      kind: EntryKind.Earn,
      reference: `ord_${faker.string.alphanumeric(26)}`,
      at: faker.date.recent(),
    };
  }
}
