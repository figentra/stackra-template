/**
 * Stackra file contract:
 * Purpose: `loyalty_kit.points.stats_today@1`: points earned and redeemed today, for the dashboard
 *          widget.
 * Boundary: read only; aggregates in SQL through the ledger entry repository. L0 because it runs
 *           under `read`, and only the `User` actor may call it (tenant-wide numbers are not for
 *           customers). The widget reaches it in process, so it keeps no HTTP route
 *           (`endpoint: false`); it is still an MCP tool.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 16 and 21), ADR 0098, ADR 0155
 */
import { Query, type QueryContext } from "@stackra/actions";
import { ActorKind } from "@stackra/contracts";
import type { Repository } from "@stackra/database";
import { Schema } from "@stackra/validation";
import { EntryKind } from "#contracts/enums/entry-kind.enum";
import { PointsIssuedView } from "#core/schemas/points-issued-view.schema";
import { LoyaltyAccountPermissions } from "#node/access/loyalty-account.permissions";
import type { LedgerEntry } from "#node/models/ledger-entry.model";

/** No fields: the day comes from the tenant time zone in the context, never from the caller. */
export class PointsIssuedInput extends Schema {}

/** Two sums over today's rows; the widget binds this query by class. */
export class PointsIssuedQuery extends Query({
  key: "points.stats_today",
  permission: LoyaltyAccountPermissions.read,
  actors: [ActorKind.User],
  endpoint: false,
}) {
  /** @param rows - the ledger entry repository; `sum` runs in SQL. */
  constructor(private readonly rows: Repository<LedgerEntry>) {
    super();
  }

  /** `ctx.startOfDay()` applies the tenant time zone from the context. */
  async handle(_input: PointsIssuedInput, ctx: QueryContext): Promise<PointsIssuedView> {
    const since = ctx.startOfDay();
    const [earned, redeemed] = await Promise.all([
      this.rows.sum("points", { kind: EntryKind.Earn, at: { $gte: since } }),
      this.rows.sum("points", { kind: EntryKind.Redeem, at: { $gte: since } }),
    ]);
    return PointsIssuedView.create({ earned, redeemed: -redeemed });
  }
}
