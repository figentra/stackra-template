/**
 * Stackra file contract:
 * Purpose: the read shape of `loyalty_kit.points.stats_today`: today's movement for the dashboard
 *          widget.
 * Boundary: a schema class only; also the props of the points-issued tile.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0128
 */
import { Schema, z } from "@stackra/schema";

/** Points credited and points spent today, in whole points. */
export class PointsIssuedView extends Schema(
  z.object({ earned: z.number().int(), redeemed: z.number().int() }),
) {}
