/**
 * Stackra file contract:
 * Purpose: the kit's node entry: the module, the postgres driver, the models and the node-side
 *          declarations a host may reference by class (actions, queries, events, the redemption
 *          signal, hooks, permissions, settings) and the migrations.
 * Boundary: explicit, named re-exports only (ADR 0006). Nothing here reaches `#testing/*`: the
 *           demo seeder is exported from ./testing, so a production server never loads Faker.
 *           Policies, listeners, widgets and documents are discovered by folder and decorator and
 *           need no export; migrations are exported because a host's manifest references them as
 *           `{ from: "@acme/loyalty-kit/node", class }`, never by `src/` path.
 * Runtime: node
 * Governing contract: ADR 0126 (entries), ADR 0006
 */
export { LoyaltyKitModule } from "#node/loyalty-kit.module";
export { PostgresLoyaltyLedger } from "#node/drivers/postgres-loyalty-ledger.driver";
export { LoyaltyAccount } from "#node/models/loyalty-account.model";
export { LedgerEntry } from "#node/models/ledger-entry.model";
export { AccountService } from "#node/services/account.service";
export { LedgerReconcilerService } from "#node/services/ledger-reconciler.service";
export { EnrollMemberAction } from "#node/actions/enroll-member.action";
export { RedeemPointsAction } from "#node/actions/redeem-points.action";
export { ConfirmRedemptionAction } from "#node/actions/confirm-redemption.action";
export { FreezeAccountAction } from "#node/actions/freeze-account.action";
export { ExpirePointsAction } from "#node/actions/expire-points.action";
export { GetBalanceQuery } from "#node/queries/get-balance.query";
export { PointsIssuedQuery } from "#node/queries/points-issued.query";
export { AccountEnrolled } from "#node/events/account-enrolled.event";
export { PointsEarned } from "#node/events/points-earned.event";
export { PointsRedeemed } from "#node/events/points-redeemed.event";
export { AccountFrozen } from "#node/events/account-frozen.event";
export { RedemptionConfirmed } from "#node/workflows/redemption-confirmed.signal";
export { LoyaltyHooks } from "#node/hooks/loyalty.hook-point";
export { LoyaltyAccountPermissions } from "#node/permissions/loyalty-account.permission";
export { LoyaltySettings } from "#node/settings/loyalty.setting";
export { CreateLoyaltyTables } from "#node/migrations/0001-create-loyalty-tables.migration";
export { LedgerEntriesAccountIdIndex } from "#node/migrations/0002-ledger-entries-account-id-index.migration";
