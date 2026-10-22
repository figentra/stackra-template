/**
 * Stackra file contract:
 * Purpose: a branded public id for a loyalty member, so a product id or an order id cannot be
 *          passed where a member is meant.
 * Boundary: a type only; the brand exists at compile time (the value is the host's principal id).
 *           The constructor is `memberId` in core/functions. `types/` appears with its second file
 *           (ADR 0130 d2); the catalogue shows the folder with one.
 * Runtime: isomorphic
 * Governing contract: ADR 0135 (public ids), ADR 0231 (abbreviation `id` allowed)
 */
import type { Branded } from "@stackra/contracts";

/**
 * The host principal's public id (`usr_…`), branded as a member. The kit never resolves it to a
 * person.
 */
export type MemberId = Branded<string, "loyalty_kit.MemberId">;
