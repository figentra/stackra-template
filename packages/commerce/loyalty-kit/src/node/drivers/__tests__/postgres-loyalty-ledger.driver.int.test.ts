/**
 * Stackra file contract:
 * Purpose: proves the postgres driver keeps the same contract as the memory driver: idempotent
 *          append, sum balance, set-based expiry that never double-expires, and covered debits
 *          that never overdraw when two race. The conformance pair ADR 0266 asks for.
 * Boundary: integration tier (.int): Testcontainers Postgres from @stackra/database/testing; the
 *           compiled migrations applied once per file.
 * Runtime: node
 * Governing contract: ADR 0266 decision 2, ADR 0182 (integration tier), ADR 0294 (decision 16),
 *                     ADR 0022
 */
import { LoyaltyKitConfig, memberId } from "@acme/loyalty-kit";
import {
  DebitOutcome,
  EntryKind,
  LoyaltyLedger,
  LoyaltyMembers,
} from "@acme/loyalty-kit/contracts";
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

  /**
   * Two debits of the whole balance race in their own transactions; the balance row's lock
   * serialises them, so exactly one is written and the balance never goes below zero.
   */
  it("writes one of two concurrent debits of the whole balance and refuses the other", async () => {
    const mod = await createTestingModule(LoyaltyKitModule)
      .useDrivers({ database: "postgres" })
      .withConfig(LoyaltyKitConfig, { ledger: "postgres" })
      .override(LoyaltyMembers, LoyaltyMembersFake.with([]))
      .compile();
    const ledger = mod.get(LoyaltyLedger);
    const usr1 = memberId("usr_1");
    const at = new Date("2026-10-21T09:00:00Z");
    await ledger.append(pointsEntry.build({ memberId: usr1, points: 100, reference: "ord_0", at }));
    const debit = (reference: string) =>
      mod.transaction(() =>
        ledger.debit({ memberId: usr1, points: -100, kind: EntryKind.Hold, reference, at }),
      );

    const outcomes = await Promise.all([debit("hold:ord_1"), debit("hold:ord_2")]);

    expect(outcomes.toSorted()).toEqual([DebitOutcome.Uncovered, DebitOutcome.Written]);
    await expect(ledger).toHaveBalance(usr1, 0);
  });
});
