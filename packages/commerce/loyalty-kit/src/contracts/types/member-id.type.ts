/**
 * Stackra file contract:
 * Purpose: a branded public id for a loyalty member, so a product id or an order id cannot be
 *          passed where a member is meant.
 * Boundary: a type only, in the leaf entry; the brand exists at compile time (the value is the
 *           host's principal id, whatever its prefix). The one constructor is `memberId` in
 *           core/functions.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 8 and 15), ADR 0135 (public ids), ADR 0231 (abbreviation
 *                     `id` allowed)
 */
import type { Branded } from "@stackra/contracts";

/** The host principal's public id, branded as a member. The kit never resolves it to a person. */
export type MemberId = Branded<string, "loyalty_kit.MemberId">;
