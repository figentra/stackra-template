/**
 * Stackra file contract:
 * Purpose: proves the module binds the ledger named by config, lets a test put its own ledger in
 *          the port's place, and fails to compile without a LoyaltyMembers driver.
 * Boundary: unit tier; nothing but the container; the same checks gen runs at build time. A
 *           replacement is `.override(Port, instance)`, never a provider list.
 * Runtime: node
 * Governing contract: ADR 0263 decisions 9 and 12, ADR 0294 (decisions 16 and 17), ADR 0022
 */
import { LoyaltyKitConfig, MemoryLoyaltyLedgerDriver } from "@acme/loyalty-kit";
import { DebitOutcome, LoyaltyLedger, LoyaltyMembers } from "@acme/loyalty-kit/contracts";
import { LoyaltyKitModule } from "@acme/loyalty-kit/node";
import { LoyaltyMembersFake } from "@acme/loyalty-kit/testing";
import { UnresolvedPortError } from "@stackra/container";
import { createTestingModule } from "@stackra/container/testing";
import { describe, expect, it } from "@stackra/testing";

/** A ledger of the kind a host writes for a test: one class extending the port. */
class HostLedger extends LoyaltyLedger {
  /** Every member holds nothing. */
  async balance(): Promise<number> {
    return 0;
  }

  /** Accepts every entry without storing it. */
  async append(): Promise<boolean> {
    return true;
  }

  /** Holds nothing, so it covers no debit. */
  async debit(): Promise<DebitOutcome> {
    return DebitOutcome.Uncovered;
  }

  /** Stores nothing, so it finds nothing. */
  async find(): Promise<null> {
    return null;
  }

  /** Has nothing to expire. */
  async expire(): Promise<number> {
    return 0;
  }
}

/**
 * Guards module wiring: a mis-bound ledger or missing port would only surface in production hosts.
 */
describe(LoyaltyKitModule, () => {
  /**
   * Config picks by name; an override wins over the name, so a test or a host never edits the
   * package.
   */
  it("binds the ledger named by config, or the ledger put in its place", async () => {
    const byConfig = await createTestingModule(LoyaltyKitModule)
      .withConfig(LoyaltyKitConfig, { ledger: "memory" })
      .override(LoyaltyMembers, LoyaltyMembersFake.with([]))
      .compile();
    expect(byConfig.get(LoyaltyLedger)).toBeInstanceOf(MemoryLoyaltyLedgerDriver);

    const byHost = await createTestingModule(LoyaltyKitModule)
      .withConfig(LoyaltyKitConfig, { ledger: "memory" })
      .override(LoyaltyLedger, new HostLedger())
      .override(LoyaltyMembers, LoyaltyMembersFake.with([]))
      .compile();
    expect(byHost.get(LoyaltyLedger)).toBeInstanceOf(HostLedger);
  });

  /**
   * The port the kit does not implement must be a boot-time failure, never a runtime `undefined`;
   * `UnresolvedPortError` is a plain `Error` (a missing binding is a bug, not a refusal).
   */
  it("fails to compile without a LoyaltyMembers driver", async () => {
    await expect(
      createTestingModule(LoyaltyKitModule).useDrivers("memory").compile(),
    ).rejects.toThrow(UnresolvedPortError);
  });
});
