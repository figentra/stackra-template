/**
 * Stackra file contract:
 * Purpose: the output of the `loyalty_kit.points.expire` job.
 * Boundary: a schema class only.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0128
 */
import { Schema, z } from "@stackra/schema";

/** Accounts visited and points removed; zeros are normal. */
export class ExpirePointsOutput extends Schema(
  z.object({ accounts: z.number().int(), points: z.number().int() }),
) {}
