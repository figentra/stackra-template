/**
 * Stackra file contract:
 * Purpose: the input of `loyalty_kit.account.freeze`: which account and which way.
 * Boundary: a schema class only.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0128
 */
import { Schema, z } from "@stackra/schema";

/** Which account and which way; freezing is the default direction. */
export class FreezeAccountInput extends Schema(
  z.object({ accountId: z.string(), isFrozen: z.boolean().default(true) }),
) {}
