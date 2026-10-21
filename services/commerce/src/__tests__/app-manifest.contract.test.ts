/**
 * Stackra file contract:
 * Purpose: proves the committed .stackra/app-manifest.json is backward compatible with the last
 *          released one (no removed action, event or permission, no narrowed input, no widened
 *          output, no renamed refusal code) and that .stackra/openapi.json is its projection.
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
    const previous = await previousRelease("@figentra/service-commerce");

    expectBackwardCompatible(previous, next);
  });

  /** openapi.json is never edited by hand, so projecting the manifest must reproduce it exactly. */
  it("is what openapi.json was projected from", async () => {
    const next = await loadManifest("./.stackra/app-manifest.json");
    expect(await projectOpenApi(next)).toEqual(await loadOpenApi("./.stackra/openapi.json"));
  });
});
