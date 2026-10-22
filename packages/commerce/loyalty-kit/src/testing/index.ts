/**
 * Stackra file contract:
 * Purpose: the kit's ./testing entry: a fake per port the host must provide, factories, matchers
 *          and the `demo` seeder with its declared ids.
 * Boundary: test and seed helpers only, built on @stackra/testing and @stackra/database/testing
 *           (Faker); no runtime entry imports this one, so a production server never loads them.
 *           Only `stackra db seed` and tests reach the seeder. Generic helpers stay in
 *           @stackra/testing; everything here knows this package's domain.
 * Runtime: isomorphic
 * Governing contract: ADR 0126 (./testing entry), ADR 0266 decision 2, ADR 0269 (domain helpers in
 *                     the owner's ./testing), ADR 0190 (seed profiles)
 */
export { FakeLoyaltyMembers } from "#testing/fakes/fake-loyalty-members.fake";
export { pointsEntry } from "#testing/factories/points-entry.factory";
export { LoyaltyAccountFactory } from "#testing/factories/loyalty-account.factory";
export { LedgerEntryFactory } from "#testing/factories/ledger-entry.factory";
export { toHaveBalance } from "#testing/matchers/to-have-balance.matcher";
export { DemoSeeder } from "#testing/seeds/demo.seed";
