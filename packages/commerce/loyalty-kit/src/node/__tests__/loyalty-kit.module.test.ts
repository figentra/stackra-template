/**
 * Stackra file contract:
 * Purpose: proves the module binds the ledger named by config, lets a test put its own ledger in
 *          the port's place, and refuses to compile without a LoyaltyMembers implementer.
 * Boundary: unit tier; nothing but the container; the same checks gen runs at build time (ADR
 *           0263). A replacement is `.override(Port, instance)`, never a provider list.
 * Runtime: node
 * Governing contract: ADR 0263 decisions 9 and 12, ADR 0022
 */
import { describe, expect, it } from "@stackra/testing";
import { refusal } from "@stackra/errors/testing";
import { Refusals } from "#stackra/manifest";
import { createTestingModule } from "@stackra/container/testing";
import { LoyaltyLedger, LoyaltyMembers, type PointsEntry } from "@acme/loyalty-kit/contracts";
import { LoyaltyKitConfig, MemoryLoyaltyLedger } from "@acme/loyalty-kit";
import { LoyaltyKitModule } from "@acme/loyalty-kit/node";
import { FakeLoyaltyMembers } from "@acme/loyalty-kit/testing";

/** A custom ledger of the kind a host writes: one class extending the port, no forRoot. */
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
   * Config picks by name; an override wins over the name, so a test or a host never edits the
   * package.
   */
  it("binds the ledger named by config, or the ledger put in its place", async () => {
    const byConfig = await createTestingModule(LoyaltyKitModule)
      .withConfig(LoyaltyKitConfig, { ledger: "memory" })
      .override(LoyaltyMembers, FakeLoyaltyMembers.with([]))
      .compile();
    expect(byConfig.get(LoyaltyLedger)).toBeInstanceOf(MemoryLoyaltyLedger);

    const byHost = await createTestingModule(LoyaltyKitModule)
      .withConfig(LoyaltyKitConfig, { ledger: "memory" })
      .override(LoyaltyLedger, new HostLedger())
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
