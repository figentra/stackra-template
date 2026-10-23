/**
 * Stackra file contract:
 * Purpose: a dashboard tile with today's points earned and redeemed.
 * Boundary: a declaration; nothing runs at request time. A widget is a query bound to a display
 *           kind: this one is a Custom display, so its renderer is the kit's React component in
 *           src/react/points-issued/, bound by the widget's name, and an app may override it. The
 *           key (`loyalty_kit.points_issued`) and the title
 *           (`loyalty_kit::widgets.points_issued.title`) are derived, and the permission is the
 *           query's. `refreshOn` sends a data-free refresh when points move; roles shape
 *           presentation only.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 20), ADR 0164, ADR 0273
 */
import { SystemRole } from "@stackra/iam";
import { Widget, WidgetDisplay, WidgetSize } from "@stackra/panel";
import { Slots } from "#stackra/slots";
import { PointsEarned } from "#node/events/points-earned.event";
import { PointsRedeemed } from "#node/events/points-redeemed.event";
import { PointsIssuedQuery } from "#node/queries/points-issued.query";

/** Shown to owners and managers in the dashboard's main slot; tenant-wide numbers. */
export class PointsIssuedWidget extends Widget({
  slot: Slots.Dashboard.Main,
  query: PointsIssuedQuery,
  display: WidgetDisplay.custom(),
  size: WidgetSize.Small,
  roles: [SystemRole.Owner, SystemRole.Manager],
  refreshOn: [PointsEarned, PointsRedeemed],
}) {}
