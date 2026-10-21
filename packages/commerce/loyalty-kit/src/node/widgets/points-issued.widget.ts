/**
 * Stackra file contract:
 * Purpose: a dashboard tile with today's points earned and redeemed.
 * Boundary: a declaration bound to a query by class; `component` is the point `PointsIssuedTile`,
 *           typed by the query's own output, which the kit's ./react entry registers. Gen fails if
 *           nothing registers it. Refreshed over realtime when points move.
 * Runtime: node
 * Governing contract: ADR 0164, ADR 0266 (phase 5: `refreshOn`)
 */
import { SystemRole } from "@stackra/iam";
import { Widget, WidgetSize } from "@stackra/panel";
import { Realm } from "@stackra/contracts";
import { Slots } from "#stackra/slots";
import { I18n } from "#stackra/i18n";
import { PointsIssuedQuery } from "#node/queries/points-issued.query";
import { PointsEarned } from "#node/events/points-earned.event";
import { PointsRedeemed } from "#node/events/points-redeemed.event";
import { LoyaltyAccountPermissions } from "#node/permissions/loyalty-account.permission";
import { PointsIssuedTile } from "#core/override-points/points-issued-tile.point";

/**
 * The tile's props are typed from the query output (`PointsIssuedView`); `roles` narrows who sees
 * tenant-wide numbers.
 */
@Widget({
  title: I18n.loyalty_kit.widgets.points_issued,
  realms: [Realm.TenantAdmin],
  slot: Slots.Dashboard.Main,
  size: WidgetSize.Small,
  query: PointsIssuedQuery,
  component: PointsIssuedTile,
  permission: LoyaltyAccountPermissions.read,
  roles: [SystemRole.Owner, SystemRole.Manager],
  refreshOn: [PointsEarned, PointsRedeemed],
})
export class PointsIssuedWidget {}
