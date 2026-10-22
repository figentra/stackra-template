/**
 * Stackra file contract:
 * Purpose: proves the module binds the ledger named by config, honours a host `@Replaces`, and
 *          refuses to compile without a LoyaltyMembers implementer.
 * Boundary: unit tier; nothing but the container; the same checks gen runs at build time (ADR
 *           0263).
 * Runtime: node
 * Governing contract: ADR 0263 decision 9, ADR 0022
 */
import { describe, expect, it } from "@stackra/testing";
import { refusal } from "@stackra/errors/testing";
import { Refusals } from "#stackra/manifest";
import { createTestingModule } from "@stackra/container/testing";
import { Replaces } from "@stackra/container";
import { LoyaltyLedger, LoyaltyMembers, type PointsEntry } from "@stackra/loyalty-kit/contracts";
import { LoyaltyKitConfig, MemoryLoyaltyLedger } from "@stackra/loyalty-kit";
import { LoyaltyKitModule } from "@stackra/loyalty-kit/node";
import { FakeLoyaltyMembers } from "@stackra/loyalty-kit/testing";

/** What a host does for a SIEM-style custom ledger: one class, no forRoot. */
@Replaces(LoyaltyLedger)
class HostLedger extends LoyaltyLedger {
  async balance(): Promise<number> {
    return 0;
  }
  async append(_entry: PointsEntry): Promise<boolean> {
    return true;
  }
  async expire(): Promise<number> {
    return 0;
  }
}

/**
 * Guards module wiring: a mis-bound ledger or missing port would only surface in production hosts.
 */
describe(LoyaltyKitModule, () => {
  /**
   * Config picks by name; a `@Replaces` class wins over the name, so a host never edits the
   * package.
   */
  it("binds the ledger named by config, or the host's @Replaces class", async () => {
    const byConfig = await createTestingModule(LoyaltyKitModule)
      .withConfig(LoyaltyKitConfig, { ledger: "memory" })
      .override(LoyaltyMembers, FakeLoyaltyMembers.with([]))
      .compile();
    expect(byConfig.get(LoyaltyLedger)).toBeInstanceOf(MemoryLoyaltyLedger);

    const byHost = await createTestingModule(LoyaltyKitModule, { providers: [HostLedger] })
      .withConfig(LoyaltyKitConfig, { ledger: "memory" })
      .override(LoyaltyMembers, FakeLoyaltyMembers.with([]))
      .compile();
    expect(byHost.get(LoyaltyLedger)).toBeInstanceOf(HostLedger);
  });

  /**
   * The port the kit does not implement must be a boot-time failure, never a runtime `undefined`.
   */
  it("refuses to compile without a LoyaltyMembers implementer", async () => {
    await expect(
      createTestingModule(LoyaltyKitModule).useDrivers("memory").compile(),
    ).rejects.toRefuseWith(refusal(Refusals.core.unresolved_port));
  });
});
