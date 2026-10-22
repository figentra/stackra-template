/**
 * Stackra file contract:
 * Purpose: proves the matcher passes on the right balance and fails with a message that names both
 *          numbers.
 * Boundary: unit tier on the memory driver, constructed directly.
 * Runtime: node
 * Governing contract: ADR 0022, ADR 0007 (amended: test docblocks)
 */
import { describe, expect, it } from "@stackra/testing";
import { memberId } from "@stackra/loyalty-kit";
import { MemoryLoyaltyLedger } from "@stackra/loyalty-kit";
import { pointsEntry, toHaveBalance } from "@stackra/loyalty-kit/testing";

/** Guards the ledger matcher the other suites trust, so a wrong balance cannot pass unnoticed. */
describe(toHaveBalance, () => {
  /**
   * The failure message must carry the actual number, or a wrong balance is hard to diagnose from
   * the assertion alone.
   */
  it("compares the ledger balance and names the actual number on failure", async () => {
    const ledger = new MemoryLoyaltyLedger();
    await ledger.append(pointsEntry.build({ points: 40 }));
    await expect(ledger).toHaveBalance(memberId("usr_1"), 40);
    await expect(expect(ledger).toHaveBalance(memberId("usr_1"), 41)).rejects.toThrow("found 40");
  });
});
