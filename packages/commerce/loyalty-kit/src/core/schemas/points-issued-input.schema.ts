/**
 * Stackra file contract:
 * Purpose: the input of `loyalty_kit.points.stats_today`: none.
 * Boundary: a schema class only; the day comes from the tenant time zone in the context, never from
 *           the caller.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0128
 */
import { Schema, z } from "@stackra/schema";

/**
 * No fields; kept as a class so the query declares an input like every other and gen can describe
 * it.
 */
export class PointsIssuedInput extends Schema(z.object({})) {}
