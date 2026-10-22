/**
 * Stackra file contract:
 * Purpose: the kit's `demo` profile: three accounts, one per tier, with one earn entry each.
 * Boundary: synthetic rows from the factories beside it in ./testing, so the seeder is exported
 *           from ./testing only and Faker never reaches the runtime entries. The deterministic
 *           ADR 0231 ids are declared once, in `DemoSeeder.ids`: they are the same principals as
 *           commerce's `orders.demo` customers, and every member that names them imports them
 *           from here. The seeder key is `loyalty_kit.demo`; the file is `demo.seed.ts`.
 * Runtime: node
 * Governing contract: ADR 0190 (profiles minimal, demo, test), ADR 0269 (domain helpers in the
 *                     owner's ./testing)
 */
import { Seeder, type SeedContext } from "@stackra/database";
import { LoyaltyTier } from "#core/enums/loyalty-tier.enum";
import { LoyaltyAccountFactory } from "#testing/factories/loyalty-account.factory";
import { LedgerEntryFactory } from "#testing/factories/ledger-entry.factory";

/** `stackra db seed --profile demo`; in tests `.seed(DemoSeeder)`. */
export class DemoSeeder extends Seeder {
  /** The seed profiles this seeder belongs to; `stackra db seed --profile demo` selects it. */
  static readonly profiles = ["demo"] as const;

  /**
   * The only place these principal ids are typed, one member per tier. Bronze is commerce's first
   * demo customer, the principal the e2e identity stub signs in; silver is the second customer.
   */
  static readonly ids = {
    bronze: "usr_01JA0000000000000000000001",
    silver: "usr_01JA0000000000000000000002",
    gold: "usr_01JA0000000000000000000003",
  } as const;

  /**
   * One account per tier with a 1 000-point earn dated at the seed clock, so the balance query has
   * an expiry to show.
   */
  async run(ctx: SeedContext): Promise<void> {
    for (const tier of LoyaltyTier.values()) {
      await new LoyaltyAccountFactory(ctx.em)
        .has(LedgerEntryFactory, 1, {
          points: 1_000,
          reference: `seed_${tier.value}`,
          at: ctx.now(),
        })
        .createOne({ memberId: DemoSeeder.ids[tier.value], tier });
    }
  }
}
