/**
 * Stackra file contract:
 * Purpose: boots the whole service from its generated wiring against a real database: the graph
 *          resolves, the compiled migrations apply (one Postgres schema per module), and the
 *          runtime registry matches the committed manifest (the conformance check of ADR 0144).
 * Boundary: integration tier (.int): Testcontainers Postgres for this file; every other driver
 *           memory; no network.
 * Runtime: node
 * Governing contract: ADR 0143 (boot errors for lifetimes and cycles), ADR 0144, ADR 0263, ADR 0294
 *                     (decisions 20 and 22), ADR 0295 (decision 9)
 */
import { createTestingModule } from "@stackra/container/testing";
import { usePostgres } from "@stackra/database/testing";
import { describe, expect, it } from "@stackra/testing";
import { manifest } from "#stackra/manifest";
import { CommerceModule } from "#stackra/module";

usePostgres();

/** The one test that touches every module at once. */
describe(CommerceModule, () => {
  /**
   * Module order is topological: catalogue injects inventory's StockService, so inventory boots
   * first, then catalogue, orders and loyalty; the registry must equal the committed manifest.
   */
  it("boots every module, action and extension, and matches the manifest", async () => {
    const app = await createTestingModule(CommerceModule)
      .useDrivers({
        database: "postgres",
        events: "memory",
        queue: "memory",
        cache: "memory",
        notifications: "memory",
      })
      .compile();

    expect(app.modules.map((module) => module.key)).toEqual([
      "inventory",
      "catalogue",
      "orders",
      "loyalty",
    ]);
    expect(app.registry()).toMatchManifest(manifest);

    await app.close();
  });
});
