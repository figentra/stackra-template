/**
 * Stackra file contract:
 * Purpose: picking another membership switches the tenant; a refused switch shows the refusal as a
 *          toast.
 * Boundary: unit tier, jsdom; the tenancy and queue fakes come from the render options.
 * Runtime: browser
 * Governing contract: ADR 0022
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen, userEvent } from "@stackra/testing/react";
import { TenantSwitcher } from "#src/components/tenant-switcher";

const memberships = [
  { tenantId: "ten_a", name: "Alpha", role: "staff" },
  { tenantId: "ten_b", name: "Beta", role: "admin" },
];

/** Guards tenant switching, a data-isolation boundary in the console. */
describe(TenantSwitcher, () => {
  /** Choosing a tenant must change the active tenant that scopes later requests. */
  it("switches to the chosen tenant", async () => {
    const { tenancy } = render(<TenantSwitcher />, {
      locale: "en",
      session: { tenants: memberships },
    });
    await userEvent.click(screen.getByRole("button", { name: "Switch tenant" }));
    await userEvent.click(screen.getByRole("menuitemradio", { name: /Beta/ }));
    expect(tenancy.current?.tenantId).toBe("ten_b");
  });

  /** A blocked switch must tell the user why, or queued changes would look lost. */
  it("toasts the refusal while mutations are queued", async () => {
    const queue = [{ key: "orders.order.create", tenantId: "ten_a" }];
    render(<TenantSwitcher />, { locale: "en", session: { tenants: memberships }, queue });
    await userEvent.click(screen.getByRole("button", { name: "Switch tenant" }));
    await userEvent.click(screen.getByRole("menuitemradio", { name: /Beta/ }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Sync your pending changes before switching",
    );
  });
});
