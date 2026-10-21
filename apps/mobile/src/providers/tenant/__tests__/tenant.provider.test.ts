/**
 * Stackra file contract:
 * Purpose: `hydrate` picks the remembered tenant, falls back to the first membership, and returns
 *          nothing signed out, so the first frame already shows the right tenant.
 * Boundary: unit tier; the storage fake is in memory; the session fake supplies memberships;
 *           `runHydrate` drives the class with an `AppContext`.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0208
 */
import { fakeSession } from "@stackra/identity/testing";
import { runHydrate } from "@stackra/navigation/testing";
import { fakeStorage } from "@stackra/storage/testing";
import { describe, expect, it } from "@stackra/testing";
import { SessionStatus } from "@stackra/identity";
import { TenantProvider } from "#src/providers/tenant";
import { PreferencesStore } from "#src/stores/preferences.store";

const session = fakeSession({ status: SessionStatus.SignedIn, tenants: 2 });
const [first, second] = session.user.tenants;

/** The one place tenant selection happens. */
describe("TenantProvider", () => {
  /** No remembered choice: the first membership. */
  it("selects the first membership on a first sign-in", async () => {
    const { value } = await runHydrate(TenantProvider, { session, storage: fakeStorage() });
    expect(value?.active).toEqual(first);
  });

  /** A remembered choice wins, read from `Prefs` before the first route. */
  it("selects the remembered tenant", async () => {
    const storage = fakeStorage();
    await storage.store(PreferencesStore).write({
      tenantByUser: { [session.user.userId]: second.tenantId },
    });
    const { value } = await runHydrate(TenantProvider, { session, storage });
    expect(value?.active).toEqual(second);
  });

  /** Signed out there is nothing to select, and the context renders without a tenant. */
  it("returns null signed out", async () => {
    const { value } = await runHydrate(TenantProvider, {
      session: fakeSession({ status: SessionStatus.SignedOut }),
      storage: fakeStorage(),
    });
    expect(value).toBeNull();
  });
});
