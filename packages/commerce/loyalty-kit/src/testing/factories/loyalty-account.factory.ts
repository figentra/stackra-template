/**
 * Stackra file contract:
 * Purpose: builds LoyaltyAccount rows with named states for policy tests and seeds; the one owner
 *          of a "typical account".
 * Boundary: extends the MikroORM Factory through @stackra/database/testing, which patches Faker in.
 *           Only tests and the seeder import factories (ADR 0269: helpers in the owner's
 *           ./testing).
 * Runtime: node
 * Governing contract: ADR 0190 (factories with states), ADR 0269
 */
import { Factory, type Faker } from "@stackra/database/testing";
import { LoyaltyTier } from "#core/enums/loyalty-tier.enum";
import { LoyaltyAccount } from "#node/models/loyalty-account.model";

/**
 * Builds loyalty accounts, active bronze unless a state says otherwise.
 *
 * @example
 * await new LoyaltyAccountFactory(em).state("frozen").createOne();
 * new LoyaltyAccountFactory(em).makeOne({ memberId: "usr_1" });   // unsaved, for a policy test
 */
export class LoyaltyAccountFactory extends Factory<LoyaltyAccount> {
  /** The model this factory builds. */
  model = LoyaltyAccount;

  /** An active bronze account for a fresh principal id. */
  protected definition(faker: Faker): Partial<LoyaltyAccount> {
    return {
      memberId: `usr_${faker.string.alphanumeric(26)}`,
      tier: LoyaltyTier.Bronze,
      isFrozen: false,
      frozenAt: null,
      notes: {},
    };
  }

  /** Named states; `.state("frozen")` merges one on top of the definition. */
  protected states = {
    frozen: (faker: Faker): Partial<LoyaltyAccount> => ({
      isFrozen: true,
      frozenAt: faker.date.recent(),
      notes: { reason: "review" },
    }),
    gold: (): Partial<LoyaltyAccount> => ({ tier: LoyaltyTier.Gold }),
  };
}
