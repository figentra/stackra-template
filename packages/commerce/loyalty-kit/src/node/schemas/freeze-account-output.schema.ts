/**
 * Stackra file contract:
 * Purpose: `FreezeAccountOutput`: the output of `loyalty_kit.account.freeze@1`: the account and
 *          whether it is frozen now.
 * Boundary: a shape class in its own file.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 13 and 26, as amended by programming model v3.1,
 *                     AGENTS.md)
 */
import type { PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";

/** The flag after the call. */
export class FreezeAccountOutput extends Schema {
  /** The account's public id. */
  accountId!: PublicId<"lac">;

  /** Whether the account is frozen now. */
  isFrozen!: boolean;
}
