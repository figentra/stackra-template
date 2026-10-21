/**
 * Stackra file contract:
 * Purpose: the shape of the merchant notes JSON column on a loyalty account.
 * Boundary: a schema class used as a model cast (`@Json(AccountNotes.schema)`); node-only because
 *           only the model and the resource form read it. `schemas/` would appear with its second
 *           file; the catalogue shows the folder.
 * Runtime: node
 * Governing contract: ADR 0095 (casts validate on write)
 */
import { Schema, z } from "@stackra/schema";

/** Free-form notes staff leave when flagging an account. */
export class AccountNotes extends Schema(
  z.object({ flaggedBy: z.string().optional(), reason: z.string().max(500).optional() }),
) {}
