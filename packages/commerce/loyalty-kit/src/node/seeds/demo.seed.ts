/**
 * Stackra file contract:
 * Purpose: the kit's `demo` profile: three accounts, one per tier, with one earn entry each.
 * Boundary: synthetic rows from the factory in ./testing, deterministic ADR 0231 ids
 *           (`DemoSeeder.members`, the same principals as commerce's `orders.demo` customers) so
 *           docs, e2e flows and tests can name them. The seeder key is `loyalty_kit.demo`; the file
 *           is `demo.seed.ts`.
 * Runtime: node
 * Governing contract: ADR 0190 (profiles minimal, demo, test), ADR 0269 (factories in ./testing)
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
   * The seeded member per tier; bronze is commerce's first demo customer, the principal the e2e
   * identity stub signs in.
   */
  static readonly members = {
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
        .createOne({ memberId: DemoSeeder.members[tier.value], tier });
    }
  }
}
