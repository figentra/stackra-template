/**
 * Stackra file contract:
 * Purpose: `PointsIssuedView`: the output of `loyalty_kit.points.stats_today@1`, today's movement
 *          for the dashboard widget.
 * Boundary: a shape class shared by the query (node) and the widget's renderer (react), so it lives
 *           in core.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 15 and 26)
 */
import { Int, Schema } from "@stackra/validation";

/** Points credited and points spent today, in whole points. */
export class PointsIssuedView extends Schema {
  /** Points earned today. */
  @Int
  earned!: number;

  /** Points redeemed today, as a positive number. */
  @Int
  redeemed!: number;
}
