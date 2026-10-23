/**
 * Stackra file contract:
 * Purpose: the switcher appears only with two or more memberships, switches the active tenant, and
 *          explains a switch refused because queued writes wait.
 * Boundary: unit tier; session, tenancy and queue fakes.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0059, ADR 0208
 */
import { SessionStatus } from "@stackra/identity";
import { fakeSession } from "@stackra/identity/testing";
import { fakeQueue } from "@stackra/query/testing";
import { describe, expect, it } from "@stackra/testing";
import { renderRoute, screen, userEvent } from "@stackra/testing/native";
import { Routes } from "#stackra/routes";

const one = fakeSession({ status: SessionStatus.SignedIn, tenants: 1 });
const two = fakeSession({ status: SessionStatus.SignedIn, tenants: 2 });
const [first, second] = two.user.tenants;

/** The profile page over its route. */
describe("Profile", () => {
  /** One membership: nothing to switch to. */
  it("hides the switcher with one membership", () => {
    renderRoute(Routes.profile, { locale: "en", session: one });
    expect(screen.queryByLabelText("Switch tenant")).toBeNull();
  });

  /** Two memberships: the other one is tappable and switches. */
  it("switches the active tenant", async () => {
    const { tenancy } = renderRoute(Routes.profile, {
      locale: "en",
      session: two,
      tenant: first.tenantId,
    });
    await userEvent.press(screen.getByTestId(`tenant-${second.tenantId}`));
    expect(tenancy.switchTo).toHaveBeenCalledWith(second.tenantId);
  });

  /** Queued writes block the switch, and the user is told why instead of nothing happening. */
  it("explains a switch refused while writes are queued", async () => {
    renderRoute(Routes.profile, {
      locale: "en",
      session: two,
      tenant: first.tenantId,
      queue: fakeQueue({ pending: 1 }),
    });
    await userEvent.press(screen.getByTestId(`tenant-${second.tenantId}`));
    expect(
      await screen.findByText("Send your waiting changes before switching workspace."),
    ).toBeTruthy();
  });
});
