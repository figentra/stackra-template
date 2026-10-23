/**
 * Stackra file contract:
 * Purpose: the hook returns the user when signed in and throws the typed refusal signed out; a
 *          switch goes through and is remembered per user; it is refused with a typed key while
 *          queued writes wait.
 * Boundary: unit tier; session, tenancy, storage and queue fakes; `createStore` reads the store
 *           back from the same storage.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0059, ADR 0208, ADR 0232
 */
import { SessionStatus } from "@stackra/identity";
import { fakeSession } from "@stackra/identity/testing";
import { fakeQueue } from "@stackra/query/testing";
import { createStore } from "@stackra/state/testing";
import { fakeStorage } from "@stackra/storage/testing";
import { describe, expect, it } from "@stackra/testing";
import { act, renderHook } from "@stackra/testing/native";
import { SessionRequiredError } from "#src/errors/session-required.error";
import { useProfile } from "#src/routes/profile/use-profile";
import { PreferencesStore } from "#src/stores/preferences.store";
import { I18n } from "#stackra/i18n";

const session = fakeSession({ status: SessionStatus.SignedIn, tenants: 2 });
const [first, second] = session.user.tenants;

/** The profile page's hook. */
describe("useProfile", () => {
  /** Signed in: the user. */
  it("returns the signed-in user", () => {
    const { result } = renderHook(() => useProfile(), { session, tenant: first.tenantId });
    expect(result.current.user.userId).toBe(session.user.userId);
  });

  /** Signed out: a programming error, surfaced as the typed `session_required` refusal. */
  it("throws SessionRequiredError when mounted signed out", () => {
    expect(() =>
      renderHook(() => useProfile(), {
        session: fakeSession({ status: SessionStatus.SignedOut }),
      }),
    ).toThrow(SessionRequiredError);
  });

  /** An empty queue: the switch applies and is remembered for this user. */
  it("switches and remembers the tenant", async () => {
    const storage = fakeStorage();
    const { result } = renderHook(() => useProfile(), {
      session,
      tenant: first.tenantId,
      storage,
    });
    await act(async () => expect(await result.current.switchTo(second.tenantId)).toBe(true));
    expect(result.current.current?.tenantId).toBe(second.tenantId);
    const preferences = await createStore(PreferencesStore, { storage });
    expect(preferences.tenantFor(session.user.userId)).toBe(second.tenantId);
  });

  /** Queued writes would replay against the wrong tenant, so the switch is refused. */
  it("refuses a switch while queued writes wait", async () => {
    const { result } = renderHook(() => useProfile(), {
      session,
      tenant: first.tenantId,
      queue: fakeQueue({ pending: 1 }),
    });
    expect(await result.current.switchTo(second.tenantId)).toBe(
      I18n.mobile.profile.switch_blocked_by_queue,
    );
  });
});
