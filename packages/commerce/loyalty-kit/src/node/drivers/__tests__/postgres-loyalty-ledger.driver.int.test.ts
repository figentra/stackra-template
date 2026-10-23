/**
 * Stackra file contract:
 * Purpose: proves the postgres driver keeps the same contract as the memory driver: idempotent
 *          append, sum balance, set-based expiry that never double-expires. The conformance pair
 *          ADR 0266 asks for.
 * Boundary: integration tier (.int): Testcontainers Postgres from @stackra/database/testing; the
 *           compiled migrations applied once per file.
 * Runtime: node
 * Governing contract: ADR 0266 decision 2, ADR 0182 (integration tier), ADR 0294 (decision 16),
 *                     ADR 0022
 */
import { LoyaltyKitConfig, memberId } from "@acme/loyalty-kit";
import { LoyaltyLedger, LoyaltyMembers } from "@acme/loyalty-kit/contracts";
import { LoyaltyKitModule, PostgresLoyaltyLedgerDriver } from "@acme/loyalty-kit/node";
import { LoyaltyMembersFake, pointsEntry } from "@acme/loyalty-kit/testing";
import { createTestingModule } from "@stackra/container/testing";
import { usePostgres } from "@stackra/database/testing";
import { describe, expect, it } from "@stackra/testing";

usePostgres(); // one container for this file; the compiled migrations run once

/**
 * Guards the Postgres driver's parity with the memory driver, since SQL constraints enforce the
 * ledger rules.
 */
describe(PostgresLoyaltyLedgerDriver, () => {
  /**
   * The same three calls the memory driver's callers make, against the unique index and the
   * insert-select.
   */
  it("appends once per reference and expires only stale earns, once", async () => {
    const mod = await createTestingModule(LoyaltyKitModule)
      .useDrivers({ database: "postgres" })
      .withConfig(LoyaltyKitConfig, { ledger: "postgres" })
      .override(LoyaltyMembers, LoyaltyMembersFake.with([]))
      .compile();
    const ledger = mod.get(LoyaltyLedger);
    const usr1 = memberId("usr_1");
    const earn = pointsEntry.build({
      memberId: usr1,
      points: 100,
      reference: "ord_1",
      at: new Date("2025-01-01"),
    });

    expect(await ledger.append(earn)).toBe(true);
    expect(await ledger.append(earn)).toBe(false);
    await expect(ledger).toHaveBalance(usr1, 100);

    expect(await ledger.expire(usr1, new Date("2026-01-01"))).toBe(100);
    expect(await ledger.expire(usr1, new Date("2026-01-01"))).toBe(0);
    await expect(ledger).toHaveBalance(usr1, 0);
  });
});
