/**
 * Stackra file contract:
 * Purpose: `loyalty_kit.points.stats_today`: points earned and redeemed today, for the dashboard
 *          widget.
 * Boundary: read only; aggregates in SQL through the repository; L0 because it runs under `read`,
 *           and only the `User` actor may call it (tenant-wide numbers are not for customers).
 * Runtime: node
 * Governing contract: ADR 0098, 0155
 */
import { Query, type QueryContext } from "@stackra/actions";
import { ActorKind } from "@stackra/contracts";
import { Repository } from "@stackra/database";
import { EntryKind } from "#core/enums/entry-kind.enum";
import { PointsIssuedInput } from "#core/schemas/points-issued-input.schema";
import { PointsIssuedView } from "#core/schemas/points-issued-view.schema";
import { LedgerEntry } from "#node/models/ledger-entry.model";
import { LoyaltyAccountPermissions } from "#node/permissions/loyalty-account.permission";

/** Two sums over today's rows; the widget binds this query by class. */
@Query({
  key: "points.stats_today",
  input: PointsIssuedInput,
  output: PointsIssuedView,
  permission: LoyaltyAccountPermissions.read,
  actors: [ActorKind.User],
})
export class PointsIssuedQuery {
  constructor(private readonly rows: Repository<LedgerEntry>) {}

  /** `ctx.startOfDay()` applies the tenant time zone from the context. */
  async handle(_input: PointsIssuedInput, ctx: QueryContext): Promise<PointsIssuedView> {
    const since = ctx.startOfDay();
    const [earned, redeemed] = await Promise.all([
      this.rows.sum("points", { kind: EntryKind.Earn, at: { $gte: since } }),
      this.rows.sum("points", { kind: EntryKind.Redeem, at: { $gte: since } }),
    ]);
    return { earned, redeemed: -redeemed };
  }
}
