/**
 * Stackra file contract:
 * Purpose: the member's balance tile: tier, balance and the expiry warning, placed by the overview
 *          document.
 * Boundary: a declaration; nothing runs at request time. A query bound to a Custom display, so its
 *           renderer is the kit's React component in src/react/points-balance/, bound by the
 *           widget's name, and an app may override it. No slot: it appears only where a document
 *           places it. The query's `accountId` is bound to the signed-in member's own account. The
 *           key (`loyalty_kit.points_balance`) and the title
 *           (`loyalty_kit::widgets.points_balance.title`) are derived, and the permission is the
 *           query's.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 20), ADR 0164, ADR 0110
 */
import { Bind, Widget, WidgetDisplay, WidgetSize } from "@stackra/panel";
import { GetBalanceQuery } from "#node/queries/get-balance.query";

/** Refreshed through the query's cache, which points moving drops. */
export class PointsBalanceWidget extends Widget({
  query: GetBalanceQuery,
  params: { accountId: Bind.actor.accountId },
  display: WidgetDisplay.custom(),
  size: WidgetSize.Medium,
}) {}
