/**
 * Stackra file contract:
 * Purpose: the output of `loyalty_kit.account.freeze`: the account's state after the call.
 * Boundary: a schema class only.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0128
 */
import { Schema, z } from "@stackra/schema";

/** The account and whether it is frozen now. */
export class FreezeAccountOutput extends Schema(
  z.object({ accountId: z.string(), isFrozen: z.boolean() }),
) {}
