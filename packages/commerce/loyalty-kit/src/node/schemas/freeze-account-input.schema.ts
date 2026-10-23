/**
 * Stackra file contract:
 * Purpose: `FreezeAccountInput`: the input of `loyalty_kit.account.freeze@1`: which account and
 *          which way.
 * Boundary: a shape class in its own file. It holds the record id, so the panel places the action
 *           on the row and the View page; `isFrozen` has a default, so no modal form opens.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 13 and 26, as amended by programming model v3.1,
 *                     AGENTS.md), ADR 0164 (placement by input)
 */
import type { PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";

/** Freezing is the default direction. */
export class FreezeAccountInput extends Schema {
  /** The account's public id; the path parameter. */
  accountId!: PublicId<"lac">;

  /** True freezes, false unfreezes. */
  isFrozen = true;
}
