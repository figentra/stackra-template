/**
 * Stackra file contract:
 * Purpose: boots the service from its generated wiring on memory drivers and checks the registry
 *          matches the manifest.
 * Boundary: unit tier (no database: the memory repository driver); the `.int` boot lives in
 *           commerce as the example.
 * Runtime: node
 * Governing contract: ADR 0143, 0144, 0263
 */
import { describe, expect, it } from "@stackra/testing";
import { createTestingModule } from "@stackra/container/testing";
import { NotificationsModule } from "#src/notifications.module";
import { manifest } from "#stackra/manifest";

/** Guards the notifications service boot and its generated manifest. */
describe(NotificationsModule, () => {
  /**
   * One module, bound to the memory transport by the config default; the registry must equal the
   * committed manifest.
   */
  it("boots and matches the committed manifest", async () => {
    const app = await createTestingModule(NotificationsModule).useDrivers("memory").compile();
    expect(app.modules().map((m) => m.key)).toEqual(["messages"]);
    expect(app.registry()).toMatchManifest(manifest);
    await app.close();
  });
});
