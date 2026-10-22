/**
 * Stackra file contract:
 * Purpose: the kit's ./testing entry: its memory driver, a fake per port the host must provide,
 *          factories and matchers.
 * Boundary: test helpers only, built on @stackra/testing and @stackra/database/testing; never
 *           imported by runtime code except the seeder. Generic helpers stay in @stackra/testing;
 *           everything here knows this package's domain.
 * Runtime: isomorphic
 * Governing contract: ADR 0126 (./testing entry), ADR 0266 decision 2, ADR 0269 (domain helpers in
 *                     the owner's ./testing)
 */
export { FakeLoyaltyMembers } from "#testing/fakes/fake-loyalty-members.fake";
export { pointsEntry } from "#testing/factories/points-entry.factory";
export { LoyaltyAccountFactory } from "#testing/factories/loyalty-account.factory";
export { LedgerEntryFactory } from "#testing/factories/ledger-entry.factory";
export { toHaveBalance } from "#testing/matchers/to-have-balance.matcher";
