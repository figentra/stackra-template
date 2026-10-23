/**
 * Stackra file contract:
 * Purpose: `GetBalanceInput`: the input of `loyalty_kit.points.balance@1`: whose balance.
 * Boundary: a shape class in its own file; a customer may pass only their own account, which the
 *           policy enforces, not this shape. The output is `BalanceView` (core, shared with the
 *           renderers).
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 13 and 26, as amended by programming model v3.1,
 *                     AGENTS.md)
 */
import type { PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";

/** The account to read. */
export class GetBalanceInput extends Schema {
  /** The account's public id; the path parameter of every loyalty account route. */
  accountId!: PublicId<"lac">;
}
