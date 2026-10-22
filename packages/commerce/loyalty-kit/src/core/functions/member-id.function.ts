/**
 * Stackra file contract:
 * Purpose: the one constructor of a {@link MemberId}: brands a principal id once it has been
 *          validated.
 * Boundary: a pure function with no runtime check of its own; the pipeline validated the id, the
 *           brand only stops a product id or an order id being passed where a member is meant.
 *           `functions/` appears with its second file, the rule ADR 0130 decision 2 sets for
 *           `interfaces/`, `types/` and `constants/`; the catalogue shows the folder with one.
 * Runtime: isomorphic
 * Governing contract: ADR 0135 (public ids), ADR 0128 (one declaration per file)
 */
import { brand } from "@stackra/contracts";
import type { MemberId } from "#core/types/member-id.type";

/**
 * Brands a principal id after the pipeline validated it; the only way to make a {@link MemberId}.
 * @example
 * const member = memberId(ctx.actor.id);
 */
export const memberId = brand<MemberId>();
