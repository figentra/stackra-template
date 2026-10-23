/**
 * Stackra file contract:
 * Purpose: the member's balance tile: tier, balance and the expiry warning, placed by the overview
 *          dashboard.
 * Boundary: a declaration; nothing runs at request time. The query is the type argument
 *           (`Widget<GetBalanceQuery>`), so `params` is checked against its input and `display`
 *           against its output. A Custom display: the renderer is the kit's PointsBalance class
 *           component, `src/react/points-balance/` on the web and `src/native/points-balance/` on
 *           native, bound by the widget's name; an app shadows it under
 *           `src/overrides/@acme/loyalty-kit/`. No slot: it appears only where a document or a host
 *           placement puts it. The query's `accountId` is bound to the signed-in member's own
 *           account. Refresh follows the query's `invalidateOn`. The key
 *           (`loyalty_kit.points_balance`) and the title
 *           (`loyalty_kit::widgets.points_balance.title`) are derived; the permission is the
 *           query's.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 20), ADR 0164 (widgets, as amended by
 *                     programming model v3.1, AGENTS.md), ADR 0110
 */
import { Bind, type Display, Widget, WidgetSize } from "@stackra/panel";
import type { BalanceView } from "#core/schemas/balance-view.schema";
import type { GetBalanceQuery } from "#node/queries/get-balance.query";

/** A medium tile wherever it is placed. */
export class PointsBalanceWidget extends Widget<GetBalanceQuery>({
  params: { accountId: Bind.actor.accountId },
  size: WidgetSize.Medium,
}) {
  /** The kit's own renderer draws the tile. */
  display(d: Display<BalanceView>) {
    return d.custom();
  }
}
