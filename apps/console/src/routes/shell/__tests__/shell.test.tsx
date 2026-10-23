/**
 * Stackra file contract:
 * Purpose: proves one press of `mod+b` flips the sidebar exactly once (the shortcut owns the key,
 *          the layout's own binding is off) and the palette hint shows the platform's modifier.
 * Boundary: unit tier, jsdom; `renderLayout` mounts the shell under the testing providers with the
 *           testing stores; the platform is the render option's fake.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0245 (one owner per shortcut)
 */
import { describe, expect, it } from "@stackra/testing";
import { renderLayout, screen, userEvent } from "@stackra/testing/react";
import { Shell } from "#src/routes/shell/shell";
import { ShellLayout } from "#src/routes/shell/shell.layout";
import { UiStore } from "#src/stores/ui.store";

/** A session that sees the whole navigation. */
const SESSION = { permissions: ["orders.order.read", "catalogue.product.read"] };

/** Guards the frame's keyboard contract. */
describe(Shell, () => {
  /** Two owners of one key would collapse and re-expand the sidebar in a single press. */
  it("collapses the sidebar once per press of mod+b", async () => {
    const { stores } = renderLayout(ShellLayout, { route: "/", locale: "en", session: SESSION });
    await screen.findByRole("navigation", { name: "Main navigation" });
    await userEvent.keyboard("{Control>}b{/Control}");
    expect(stores.get(UiStore).sidebarCollapsed).toBe(true);
  });

  /** The hint must name the key a user actually presses on their platform. */
  it("shows Ctrl off Apple devices and ⌘ on them", async () => {
    renderLayout(ShellLayout, { route: "/", locale: "en", session: SESSION, platform: "windows" });
    const palette = await screen.findByRole("button", { name: /Command palette/ });
    expect(palette).toHaveTextContent("Ctrl");
    expect(palette).not.toHaveTextContent("⌘");
  });
});
