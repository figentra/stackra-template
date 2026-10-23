/**
 * Stackra file contract:
 * Purpose: what a covered debit on the ledger did: written, already applied, or refused because the
 *          balance did not cover it.
 * Boundary: an `Enum.of` value plus the type of the same name, in the leaf entry; returned by
 *           `LoyaltyLedger#debit`, so the port needs no refusal class (refusals live in core).
 *           LoyaltyService turns `uncovered` into InsufficientPointsError. Codes are snake_case.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 15, 16 and 20), ADR 0231 (snake_case codes)
 */
import { Enum } from "@stackra/contracts";

/** Exactly one case per debit call; `duplicate` and `uncovered` change nothing. */
export const DebitOutcome = Enum.of({
  Written: "written",
  Duplicate: "duplicate",
  Uncovered: "uncovered",
});

/** One of the codes above. */
export type DebitOutcome = Enum.Value<typeof DebitOutcome>;
