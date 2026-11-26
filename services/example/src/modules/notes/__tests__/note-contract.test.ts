/**
 * Stackra file contract:
 * Purpose: unit tests of the notes module's contract as gen derived it into the committed `stackra.manifest.json`: the
 *          note model is tenant-owned (`BelongsToTenant`), every note action and query has its derived permission,
 *          every write is at least L2, and `note.create` requires an idempotency key. These are the properties a team
 *          copies from the example, so a change that drops one fails here as well as in gen.
 * Boundary: test only; reads the committed manifest, which `stackra gen --check` keeps equal to the source.
 * Runtime: node (vitest)
 * Governing contract: ADR 0022 (test placement); ADR 0294 (decision 10: the committed manifest); ADR 0239 (decision 1:
 *                     tenant-owned rows); ADR 0099 (risk); ADR 0360 (decision 4: idempotency).
 */
import { readFileSync } from "node:fs";

import { describe, expect, it } from "@stackra/testing";

/** The parts of the manifest this test reads. */
interface Manifest {
  readonly models: readonly { readonly key: string; readonly traits: readonly string[] }[];
  readonly actions: readonly {
    readonly key: string;
    readonly kind: string;
    readonly module: string;
    readonly permission?: string;
    readonly risk?: string;
    readonly idempotency?: string;
  }[];
}

const manifest = JSON.parse(
  readFileSync(new URL("../../../../stackra.manifest.json", import.meta.url), "utf8"),
) as Manifest;

const notes = manifest.actions.filter((action) => action.module === "notes");

/** The notes module as gen sees it. */
describe("the notes module contract", () => {
  /** The row policy and the tenant column come from the trait; without it a tenant reads every tenant's notes. */
  it("has a tenant-owned note model", () => {
    const note = manifest.models.find((model) => model.key === "notes.note");
    expect(note?.traits).toContain("BelongsToTenant");
  });

  /** The five operations of the resource, each with the permission derived from its key. */
  it("derives a permission for every note action and query", () => {
    expect(notes.map((action) => [action.key, action.permission]).toSorted()).toEqual([
      ["notes.note.create@1", "notes.note.create"],
      ["notes.note.delete@1", "notes.note.delete"],
      ["notes.note.get@1", "notes.note.read"],
      ["notes.note.list@1", "notes.note.read"],
      ["notes.note.update@1", "notes.note.update"],
    ]);
  });

  /** A write is never below L2 (ADR 0099); a read stays at L0. */
  it("puts every write at L2 or above and every read at L0", () => {
    for (const action of notes)
      expect([action.key, action.risk]).toEqual([
        action.key,
        action.kind === "query" ? "L0" : expect.stringMatching(/^L[2-4]$/),
      ]);
  });

  /** A create is not idempotent by itself, so a client must send `Idempotency-Key`. */
  it("requires an idempotency key on note.create", () => {
    expect(notes.find((action) => action.key === "notes.note.create@1")?.idempotency).toBe(
      "required",
    );
  });
});
