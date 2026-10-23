/**
 * Stackra file contract:
 * Purpose: proves the root module boots from the generated renderer wiring with the testing
 *          drivers, mounts both panels, mounts the platform contexts from their config classes in
 *          graph order (the console writes no provider), and keeps the peripherals in the
 *          main-process wiring.
 * Boundary: unit tier on the client container: jsdom only, no network; drivers are the testing
 *           fakes the wiring names.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0263, ADR 0295 (decisions 9 and 10), ADR 0164
 */
import { createTestingModule } from "@stackra/container/testing";
import { ReceiptPrinter } from "@stackra/peripherals/contracts";
import { Platform } from "@stackra/platform/contracts";
import { Storage } from "@stackra/storage/contracts";
import { describe, expect, it } from "@stackra/testing";
import { Panels } from "#stackra/panels";
import { wiring } from "#stackra/wiring";
import { mainWiring } from "#stackra-desktop/wiring";
import { ConsoleModule } from "#src/console.module";

/** Builds the renderer side of the console the way `.stackra/entry/browser.ts` does. */
function compile() {
  return createTestingModule(ConsoleModule, {
    wiring,
    drivers: createTestingModule.fakes(),
  }).compile();
}

/** Guards console boot, where a missing binding breaks the whole app. */
describe(ConsoleModule, () => {
  /** The generated wiring must provide every port the shell resolves at start-up. */
  it("boots with the generated wiring and the testing drivers", async () => {
    const app = await compile();
    expect(app.has(Storage)).toBe(true);
    expect(app.has(Platform)).toBe(true);
    expect(app.panels()).toEqual([Panels.TenantAdmin, Panels.CustomerPortal]);
  });

  /**
   * The session, tenant, query, realtime and flags providers the console used to write are now the
   * packages' contexts, mounted from their config classes; the order is the one ADR 0295 fixes.
   */
  it("mounts the platform contexts from their config classes in graph order", async () => {
    const app = await compile();
    const replaced = ["identity", "tenancy", "query", "realtime", "feature_flags", "platform"];
    const mounted = app.contexts().map((context) => context.key);
    expect(mounted.filter((key) => replaced.includes(key))).toEqual(replaced);
    expect(mounted.at(-1)).toBe("ui"); // the UI kit with its toasts, innermost
  });

  /** Hardware drivers run in Electron main; the renderer reaches them only through a bridge. */
  it("keeps the peripherals in the main-process wiring, out of the renderer's", async () => {
    const renderer = await compile();
    expect(renderer.has(ReceiptPrinter)).toBe(false);
    expect(mainWiring.drivers.map((driver) => driver.port)).toContain(ReceiptPrinter);
  });
});
