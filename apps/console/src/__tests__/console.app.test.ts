/**
 * Stackra file contract:
 * Purpose: proves the root boots from the generated wiring with the testing drivers, mounts both
 *          declared panels, and every required override point of the consumed manifests has a
 *          component registered.
 * Boundary: unit tier on the client container: jsdom only, no network; drivers are the testing
 *           fakes the wiring names.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0263, ADR 0164, ADR 0007
 */
import { bootstrapClient } from "@stackra/app/react";
import { createTestingModule } from "@stackra/container/testing";
import { Platform } from "@stackra/platform/contracts";
import { ReceiptPrinter } from "@stackra/peripherals/contracts";
import { Storage } from "@stackra/storage/contracts";
import { describe, expect, it } from "@stackra/testing";
import { Commerce } from "#stackra/clients";
import { overrides } from "#stackra/overrides";
import { Panels } from "#stackra/panels";
import { wiring } from "#stackra/wiring";
import { ConsoleApp } from "#src/console.app";

/** Guards console boot, where a missing binding breaks the whole app. */
describe(ConsoleApp, () => {
  /** The generated wiring must provide every port the shell resolves at start-up. */
  it("boots with the generated wiring and the testing drivers", async () => {
    const container = await bootstrapClient(ConsoleApp, {
      wiring,
      drivers: createTestingModule.fakes(),
    });
    expect(container.has(Storage)).toBe(true);
    expect(container.has(Platform)).toBe(true);
    expect(container.has(ReceiptPrinter)).toBe(true);
    expect(container.panels()).toEqual([Panels.TenantAdmin, Panels.CustomerPortal]);
  });

  /**
   * A required point (the revenue sparkline) with no override would fail gen; this guards the
   * committed sample.
   */
  it("shadows only declared points and covers every required one", () => {
    for (const entry of overrides) expect(entry.declared).toBe(true);
    const sparkline = overrides.find((o) => o.point === Commerce.overrides.RevenueSparkline);
    expect(sparkline?.binding).toBeDefined();
  });
});
