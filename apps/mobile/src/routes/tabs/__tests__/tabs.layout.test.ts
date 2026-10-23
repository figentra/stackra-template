/**
 * Stackra file contract:
 * Purpose: the shell's loader redirects to sign-in without a session (keeping the deep link to
 *          resume), and signed in selects the remembered tenant, else the first membership.
 * Boundary: unit tier; `runLoader` runs the loader with a faked session, an in-memory storage and
 *           a recording tenant switcher.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0206, ADR 0208
 */
import { SessionStatus } from "@stackra/identity";
import { fakeSession } from "@stackra/identity/testing";
import { runLoader } from "@stackra/navigation/testing";
import { fakeStorage } from "@stackra/storage/testing";
import { describe, expect, it } from "@stackra/testing";
import { TabsLayout } from "#src/routes/tabs/tabs.layout";
import { PreferencesStore } from "#src/stores/preferences.store";
import { Routes } from "#stackra/routes";

const session = fakeSession({ status: SessionStatus.SignedIn, tenants: 2 });
const [first, second] = session.user.tenants;

/** The one behaviour the layout carries. */
describe("TabsLayout.loader", () => {
  /** Signed out: redirect, with `resume` so the original link replays after sign-in. */
  it("redirects to sign-in without a session", async () => {
    const { result } = await runLoader(TabsLayout, {
      session: fakeSession({ status: SessionStatus.SignedOut }),
    });
    expect(result).toEqual({ redirect: Routes.sign_in, params: { resume: true } });
  });

  /** No remembered choice: the first membership; child routes still check their own permission. */
  it("selects the first membership on a first sign-in", async () => {
    const { result, tenancy } = await runLoader(TabsLayout, { session, storage: fakeStorage() });
    expect(result).toBeNull();
    expect(tenancy.switchTo).toHaveBeenCalledWith(first.tenantId);
  });

  /** A remembered choice wins, read from `Prefs` before the first tab. */
  it("selects the remembered tenant", async () => {
    const storage = fakeStorage();
    await storage.store(PreferencesStore).write({
      tenantByUser: { [session.user.userId]: second.tenantId },
    });
    const { tenancy } = await runLoader(TabsLayout, { session, storage });
    expect(tenancy.switchTo).toHaveBeenCalledWith(second.tenantId);
  });
});
