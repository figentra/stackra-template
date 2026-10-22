/**
 * Stackra file contract:
 * Purpose: the input of the `loyalty_kit.points.expire` job.
 * Boundary: a schema class only.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0128
 */
import { Schema, z } from "@stackra/schema";

/** How many accounts one run visits; the cron passes 500. */
export class ExpirePointsInput extends Schema(
  z.object({ batchSize: z.number().int().min(1).max(5_000).default(500) }),
) {}
