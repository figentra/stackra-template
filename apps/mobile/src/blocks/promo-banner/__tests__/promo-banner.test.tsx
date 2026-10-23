/**
 * Stackra file contract:
 * Purpose: the renderer hands the call to action's event to the renderer's sink unchanged (the
 *          props themselves are tested in promo-banner.block.test.ts).
 * Boundary: unit tier; one render.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0110
 */
import { describe, expect, it, vi } from "@stackra/testing";
import { render, screen, userEvent } from "@stackra/testing/native";
import { PromoBanner } from "#src/blocks/promo-banner/promo-banner";
import { CtaVerb } from "#src/enums/cta-verb.enum";
import { RouteKey } from "#stackra/routes";

/** The block's renderer. */
describe("PromoBanner", () => {
  /** The cta's event reaches `onEvent` as declared; the block decides nothing. */
  it("dispatches the cta event through onEvent", async () => {
    const onEvent = vi.fn();
    const event = { verb: CtaVerb.Navigate, route: RouteKey.CreateOrder };
    render(
      <PromoBanner headline="Ramadan offers" cta={{ label: "Order", event }} onEvent={onEvent} />,
    );
    await userEvent.press(screen.getByRole("button", { name: "Order" }));
    expect(onEvent).toHaveBeenCalledWith(event);
  });
});
