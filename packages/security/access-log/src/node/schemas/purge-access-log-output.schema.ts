/**
 * Stackra file contract:
 * Purpose: the output of the `access_log.entry.purge` job: how many records it deleted.
 * Boundary: a schema class only.
 * Runtime: node
 * Governing contract: ADR 0095, ADR 0128
 */
import { Schema, z } from "@stackra/schema";

/** Records deleted by one run; zero is normal on a quiet day. */
export class PurgeAccessLogOutput extends Schema(z.object({ deleted: z.number().int() })) {}
