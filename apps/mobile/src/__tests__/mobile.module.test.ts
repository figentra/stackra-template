/**
 * Stackra file contract:
 * Purpose: the root module boots from the generated wiring with the native drivers' fakes: the
 *          storage and platform ports resolve, the compiled modules load in dependency order with
 *          identity first, and every config override replaces its package's base.
 * Boundary: unit tier on the client container: no device, no network; every port is the memory
 *           fake the testing module supplies.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0263, ADR 0295 (decisions 9 and 10)
 */
import { createTestingModule } from "@stackra/container/testing";
import { QueryConfig } from "@stackra/query";
import { Platform } from "@stackra/platform";
import { Storage } from "@stackra/storage";
import { describe, expect, it } from "@stackra/testing";
import { MobileQueryConfig } from "#src/config/query.config";
import { MobileModule } from "#src/mobile.module";

/** The root boots and gen's ordering holds. */
describe(MobileModule, () => {
  /** The storage and platform ports resolve by type from the native wiring. */
  it("boots with the generated wiring and the native drivers", async () => {
    const app = await createTestingModule(MobileModule).compile();
    expect(app.has(Storage)).toBe(true);
    expect(app.has(Platform)).toBe(true);
    await app.close();
  });

  /** Identity boots first; catalogue precedes orders, which depends on it. */
  it("loads the compiled modules in dependency order", async () => {
    const app = await createTestingModule(MobileModule).compile();
    expect(app.modules.map((module) => module.key)).toEqual([
      "identity",
      "devices",
      "catalogue",
      "orders",
      "messages",
      "experience",
    ]);
    await app.close();
  });

  /** A package reads its own base class and gets the app's override, so its context sees it. */
  it("resolves a package's config base to the app's override", async () => {
    const app = await createTestingModule(MobileModule).compile();
    expect(app.get(QueryConfig)).toBeInstanceOf(MobileQueryConfig);
    await app.close();
  });
});
