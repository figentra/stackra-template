/**
 * Stackra file contract:
 * Purpose: `PointsIssuedInput`: the input of `loyalty_kit.points.stats_today@1`.
 * Boundary: a shape class in its own file with no fields: the day comes from the tenant time zone
 *           in the context, never from the caller. The output is `PointsIssuedView` (core, shared
 *           with the renderer).
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 13 and 26, as amended by programming model v3.1,
 *                     AGENTS.md)
 */
import { Schema } from "@stackra/validation";

/** No fields. */
export class PointsIssuedInput extends Schema {}
