/**
 * Stackra file contract:
 * Purpose: proves the committed stackra.manifest.json is backward compatible with the last released
 *          one (no removed action, event or permission, no narrowed input, no widened output, no
 *          renamed refusal code), that every broadcast declares a permission and an audience
 *          (OrderPaid's are `orders.order.read` and the tenant) and that openapi.json is its
 *          projection.
 * Boundary: contract tier; reads the two committed files at the member root, boots nothing. A break
 *           needs a dated change, a new event version or a new key; a rename needs `@Renamed`,
 *           which `stackra gen --check` enforces separately.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 10, 20 and 22), ADR 0158, ADR 0131, ADR 0260
 */
import {
  expectBackwardCompatible,
  loadManifest,
  loadOpenApi,
  previousRelease,
  projectOpenApi,
} from "@stackra/gen/testing";
import { describe, expect, it } from "@stackra/testing";

/** The committed contract files of this member. */
describe("stackra.manifest.json", () => {
  /** The manifest published with the last git tag is the baseline; anything narrowed fails here. */
  it("only adds to the last release", async () => {
    const next = await loadManifest("./stackra.manifest.json");
    const previous = await previousRelease("@acme/service-commerce");

    expectBackwardCompatible(previous, next);
  });

  /**
   * OrderPaid's payload carries the paid total and the customer id, so its broadcast must declare
   * the read permission; every other broadcast must declare one too, since a channel without one
   * would reach every session of the tenant, and an audience, so a tenant-wide refresh is chosen,
   * never fallen into.
   */
  it("declares a permission and an audience on every broadcast, read on order.paid", async () => {
    const manifest = await loadManifest("./stackra.manifest.json");
    const paid = manifest.events.find((event) => event.name === "orders.order.paid.v1");

    expect(paid?.broadcast).toEqual({
      channel: "tenant.{tenantId}.orders",
      permission: "orders.order.read",
      audience: "tenant",
    });
    for (const event of manifest.events.filter((candidate) => candidate.broadcast)) {
      expect(event.broadcast?.permission, event.name).toBeTruthy();
      expect(event.broadcast?.audience, event.name).toBeTruthy();
    }
  });

  /** openapi.json is never edited by hand, so projecting the manifest must reproduce it exactly. */
  it("is what openapi.json was projected from", async () => {
    const next = await loadManifest("./stackra.manifest.json");
    expect(await projectOpenApi(next)).toEqual(await loadOpenApi("./openapi.json"));
  });
});
