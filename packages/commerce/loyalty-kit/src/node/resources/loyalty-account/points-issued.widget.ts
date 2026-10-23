/**
 * Stackra file contract:
 * Purpose: a dashboard tile with today's points earned and redeemed.
 * Boundary: a declaration; nothing runs at request time. The query is the type argument
 *           (`Widget<PointsIssuedQuery>`), so `display` is checked against its output. A Custom
 *           display: the renderer is the kit's PointsIssued class component in
 *           src/react/points-issued/, bound by the widget's name; an app shadows it under
 *           `src/overrides/@acme/loyalty-kit/`. Its default place is the home dashboard's main
 *           grid; a host moves it with `Widget.place`. No `refreshOn`: refresh is derived from the
 *           query's `cache.invalidateOn`. The key (`loyalty_kit.points_issued`) and the title
 *           (`loyalty_kit::widgets.points_issued.title`) are derived, and the permission is the
 *           query's. Roles shape presentation only.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 20), ADR 0164 (widgets, as amended by
 *                     programming model v3.1, AGENTS.md), ADR 0273
 */
import { SystemRole } from "@stackra/iam";
import { type Display, Widget, WidgetSize } from "@stackra/panel";
import { Slots } from "#stackra/slots";
import type { PointsIssuedView } from "#core/schemas/points-issued-view.schema";
import type { PointsIssuedQuery } from "#node/queries/points-issued.query";

/** Shown to owners and managers on their default dashboard; tenant-wide numbers. */
export class PointsIssuedWidget extends Widget<PointsIssuedQuery>({
  slot: Slots.Dashboard.Main,
  size: WidgetSize.Small,
  roles: [SystemRole.Owner, SystemRole.Manager],
}) {
  /** The kit's own renderer draws the tile. */
  display(d: Display<PointsIssuedView>) {
    return d.custom();
  }
}
