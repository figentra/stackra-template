/**
 * Stackra file contract:
 * Purpose: a remembered tenant survives a new store instance over the same storage, and one user's
 *          choice never leaks into another's.
 * Boundary: unit tier; the storage fake is in memory; `createStore` hydrates from it.
 * Runtime: isomorphic
 * Governing contract: ADR 0022, ADR 0079, ADR 0256
 */
import { createStore } from "@stackra/state/testing";
import { fakeStorage } from "@stackra/storage/testing";
import { describe, expect, it } from "@stackra/testing";
import { PreferencesStore } from "#src/stores/preferences.store";

/** The one persisted preference. */
describe("PreferencesStore", () => {
  /** Persistence: a second instance over the same storage reads what the first wrote. */
  it("persists the remembered tenant per user", async () => {
    const storage = fakeStorage();
    const first = await createStore(PreferencesStore, { storage });
    first.rememberTenant("usr_1", "ten_2");
    const second = await createStore(PreferencesStore, { storage });
    expect(second.tenantFor("usr_1")).toBe("ten_2");
  });

  /** Isolation: an unknown user has no remembered tenant. */
  it("keeps users apart", async () => {
    const store = await createStore(PreferencesStore, { storage: fakeStorage() });
    store.rememberTenant("usr_1", "ten_2");
    expect(store.tenantFor("usr_2")).toBeUndefined();
  });
});
