/**
 * Stackra file contract:
 * Purpose: proves the tenant tab appears only for an actor who may manage settings, shows a locked
 *          value as read-only, and maps the server's `settings_locked` refusal onto its field
 *          through the route's `submit`.
 * Boundary: unit tier, jsdom; the settings reader and the platform client are testing fakes.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0213, ADR 0007
 */
import { fakeClient } from "@stackra/clients/testing";
import { refusal } from "@stackra/errors/testing";
import { describe, expect, it } from "@stackra/testing";
import { renderRoute, screen, userEvent } from "@stackra/testing/react";
import { Platform } from "#stackra/clients";
import { Settings } from "#stackra/settings";
import { SettingsRoute } from "#src/routes/settings.route";
import { Routes } from "#stackra/routes";

/** The one tenant key the cases lock. */
const KEY = Settings.orders.customersMayCancel.path;

/** Guards the settings screen, which mixes device, privacy, tenant and permission-gated values. */
describe(SettingsRoute, () => {
  /** Actors without settings.manage must not see the tenant tab at all. */
  it("hides the tenant tab from an actor without settings.manage", async () => {
    renderRoute(Routes.settings, { locale: "en", session: { permissions: [] } });
    expect(await screen.findByRole("tab", { name: "This device" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Privacy" })).toBeTruthy();
    expect(screen.queryByRole("tab", { name: "Tenant" })).toBeNull();
  });

  /**
   * A platform lock is shown, not hidden; saving still reaches the server, which answers per field.
   */
  it("shows a locked tenant value and surfaces the server refusal on the field", async () => {
    const locked = refusal(Platform.refusals.settings_locked, {
      fields: { [KEY]: "settings_locked" },
    });
    const platform = fakeClient(Platform, (fake) => fake.actions.SetSettingValues.throws(locked));
    renderRoute(Routes.settings, {
      locale: "en",
      clients: [platform],
      session: { permissions: ["settings.value.manage"] },
      settings: { values: { [KEY]: true }, provenance: { [KEY]: "locked" } },
    });
    await userEvent.click(await screen.findByRole("tab", { name: "Tenant" }));
    expect(screen.getByLabelText("Customers may cancel unpaid orders")).toHaveAttribute(
      "aria-readonly",
      "true",
    );
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("This setting is locked by the platform.")).toBeTruthy();
  });
});
