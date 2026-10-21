/**
 * Stackra file contract:
 * Purpose: the input of `loyalty_kit.points.balance`: which account's balance to read.
 * Boundary: a schema class only; the account id is the path parameter of every loyalty account
 *           route.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0128 (one declaration per file)
 */
import { Schema, z } from "@stackra/schema";

/** Whose balance; a customer may only pass their own account (LoyaltyAccountPolicy.read). */
export class GetBalanceInput extends Schema(z.object({ accountId: z.string() })) {}
