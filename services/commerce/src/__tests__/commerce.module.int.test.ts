/**
 * Stackra file contract:
 * Purpose: boots the whole service from its generated wiring against a real database: the graph
 *          resolves, the compiled migrations apply, and the runtime registry matches the manifest
 *          (the conformance check of ADR 0144).
 * Boundary: integration tier (.int): Testcontainers Postgres for this file; every other driver
 *           memory; no network.
 * Runtime: node
 * Governing contract: ADR 0143 (boot errors for scope and cycles), ADR 0144, ADR 0263,
 *                     guides/programming-model.mdx#kind-reference
 */
import { describe, expect, it } from "@stackra/testing";
import { createTestingModule } from "@stackra/container/testing";
import { usePostgres } from "@stackra/database/testing";
import { CommerceModule } from "#src/commerce.module";
import { manifest } from "#stackra/manifest";

usePostgres();

/** The one test that touches every module at once. */
describe(CommerceModule, () => {
  /**
   * Module order is topological: catalogue injects inventory's StockService, so inventory boots
   * first, then catalogue, orders and loyalty; the registry must equal the committed manifest.
   */
  it("boots with every module, action and hook resolvable, and matches the manifest", async () => {
    const app = await createTestingModule(CommerceModule)
      .useDrivers({
        database: "postgres",
        events: "memory",
        queue: "memory",
        cache: "memory",
        mail: "memory",
      })
      .compile();

    expect(app.modules.map((m) => m.key)).toEqual(["inventory", "catalogue", "orders", "loyalty"]);
    expect(app.registry()).toMatchManifest(manifest);

    await app.close();
  });
});
