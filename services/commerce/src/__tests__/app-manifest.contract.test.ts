/**
 * Stackra file contract:
 * Purpose: proves the committed .stackra/app-manifest.json is backward compatible with the last
 *          released one (no removed action, event or permission, no narrowed input, no widened
 *          output, no renamed refusal code), that every broadcast declares a permission (OrderPaid's
 *          is `orders.order.read`) and that .stackra/openapi.json is its projection.
 * Boundary: contract tier; reads files only, boots nothing. A break needs a dated @Change or a new
 *           key (ADR 0118, 0131).
 * Runtime: node
 * Governing contract: ADR 0158 (manifest is the contract), 0131, 0260
 */
import { describe, expect, it } from "@stackra/testing";
import {
  expectBackwardCompatible,
  loadManifest,
  loadOpenApi,
  previousRelease,
  projectOpenApi,
} from "@stackra/gen/testing";

/** The committed contract files of this member. */
describe("app-manifest.json", () => {
  /** The manifest published with the last git tag is the baseline; anything narrowed fails here. */
  it("only adds to the last release", async () => {
    const next = await loadManifest("./.stackra/app-manifest.json");
    const previous = await previousRelease("@acme/service-commerce");

    expectBackwardCompatible(previous, next);
  });

  /**
   * OrderPaid's payload carries the paid total and the customer id, so its broadcast must declare
   * the read permission; every other broadcast must declare one too, since a channel without one
   * would reach every session of the tenant.
   */
  it("declares a permission on every broadcast, read on order.paid", async () => {
    const manifest = await loadManifest("./.stackra/app-manifest.json");
    const paid = manifest.events.find((event) => event.name === "orders.order.paid.v1");

    expect(paid?.broadcast).toEqual({
      channel: "tenant.{tenantId}.orders",
      permission: "orders.order.read",
    });
    for (const event of manifest.events.filter((candidate) => candidate.broadcast)) {
      expect(event.broadcast?.permission, event.name).toBeTruthy();
    }
  });

  /** openapi.json is never edited by hand, so projecting the manifest must reproduce it exactly. */
  it("is what openapi.json was projected from", async () => {
    const next = await loadManifest("./.stackra/app-manifest.json");
    expect(await projectOpenApi(next)).toEqual(await loadOpenApi("./.stackra/openapi.json"));
  });
});
