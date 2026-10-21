/**
 * Stackra file contract:
 * Purpose: a switch goes through and is remembered per user; it is refused with a typed key while
 *          queued writes wait.
 * Boundary: unit tier; tenancy, storage and queue fakes.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0059, ADR 0208
 */
import { fakeSession } from "@stackra/identity/testing";
import { fakeQueue } from "@stackra/query/testing";
import { fakeStorage } from "@stackra/storage/testing";
import { describe, expect, it } from "@stackra/testing";
import { act, renderHook } from "@stackra/testing/native";
import { SessionStatus } from "@stackra/identity";
import { useActiveTenant } from "#src/providers/tenant";
import { I18n } from "#stackra/i18n";

const session = fakeSession({ status: SessionStatus.SignedIn, tenants: 2 });
const [first, second] = session.user.tenants;

/** The tenant hook pages use. */
describe("useActiveTenant", () => {
  /** An empty queue: the switch applies and is remembered for this user. */
  it("switches and remembers the tenant", async () => {
    const storage = fakeStorage();
    const { result } = renderHook(() => useActiveTenant(), {
      session,
      tenant: first.tenantId,
      storage,
    });
    await act(async () => expect(await result.current.switchTo(second.tenantId)).toBe(true));
    expect(result.current.current?.tenantId).toBe(second.tenantId);
  });

  /** Queued writes would replay against the wrong tenant, so the switch is refused. */
  it("refuses a switch while queued writes wait", async () => {
    const { result } = renderHook(() => useActiveTenant(), {
      session,
      tenant: first.tenantId,
      queue: fakeQueue({ pending: 1 }),
    });
    expect(await result.current.switchTo(second.tenantId)).toBe(
      I18n.mobile.profile.switch_blocked_by_queue,
    );
  });
});
