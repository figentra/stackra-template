/**
 * Stackra file contract:
 * Purpose: boots the service from its generated wiring on memory drivers and checks that the
 *          runtime registry matches the committed stackra.manifest.json.
 * Boundary: unit tier (no database: the memory repository driver); the `.int` boot against
 *           Postgres lives in commerce as the example.
 * Runtime: node
 * Governing contract: ADR 0143, ADR 0144, ADR 0263, ADR 0294 (decisions 20 and 22)
 */
import { createTestingModule } from "@stackra/container/testing";
import { describe, expect, it } from "@stackra/testing";
import { manifest } from "#stackra/manifest";
import { NotificationsModule } from "#src/notifications.module";

/** Guards the notifications service boot and its committed manifest. */
describe(NotificationsModule, () => {
  /**
   * One module, bound to the memory transport by the config default; the registry must equal the
   * committed manifest.
   */
  it("boots and matches the committed manifest", async () => {
    const app = await createTestingModule(NotificationsModule).useDrivers("memory").compile();

    expect(app.modules.map((module) => module.key)).toEqual(["messages"]);
    expect(app.registry()).toMatchManifest(manifest);

    await app.close();
  });
});
