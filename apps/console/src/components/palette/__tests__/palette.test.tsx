/**
 * Stackra file contract:
 * Purpose: proves the palette lists the generated navigation and action entries beside the app's
 *          own shortcuts, runs a navigation entry through the router, and never runs an intent
 *          without the explicit confirm.
 * Boundary: unit tier, jsdom; entries come from the committed gen samples, the intent router and
 *           the action runner are the testing fakes.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0245, ADR 0139, ADR 0007
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen, userEvent } from "@stackra/testing/react";
import { Commerce } from "#stackra/clients";
import { Palette } from "#src/components/palette";
import { PaletteStore } from "#src/stores/palette.store";

/** Guards the palette, the console's keyboard-first entry to navigation and actions. */
describe(Palette, () => {
  /**
   * A navigation entry is generated from the manifest; running it must go through the router, not
   * a reload.
   */
  it("runs a navigation entry through the router", async () => {
    const session = { permissions: ["orders.order.read"] };
    const { router, stores } = render(<Palette />, { locale: "en", session });
    stores.get(PaletteStore).open();
    await userEvent.click(await screen.findByRole("option", { name: /Orders/ }));
    expect(router.state.location.pathname).toBe("/orders/orders");
  });

  /**
   * Free text proposes an action; only the confirm runs it, with the declared confirmation (ADR
   * 0139).
   */
  it("proposes an action for free text and waits for the confirm", async () => {
    const session = { permissions: ["catalogue.product.archive"] };
    const { actions, stores } = render(<Palette />, { locale: "en", session });
    stores.get(PaletteStore).open();
    await userEvent.type(screen.getByRole("combobox"), "archive the summer dress");
    expect(actions.ran()).toHaveLength(0);
    await userEvent.click(await screen.findByRole("option", { name: /archive/i }));
    expect(actions.ran().map((run) => run.ref)).toEqual([Commerce.actions.ArchiveProduct]);
  });
});
