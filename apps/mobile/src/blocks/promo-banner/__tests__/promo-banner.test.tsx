/**
 * Stackra file contract:
 * Purpose: the block hands its event to the renderer unchanged (the props schema is tested in
 *          schemas/__tests__).
 * Boundary: unit tier; one render.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0110
 */
import { describe, expect, it, vi } from "@stackra/testing";
import { render, screen, userEvent } from "@stackra/testing/native";
import { PromoBanner } from "#src/blocks/promo-banner";
import type { RouteKey } from "#stackra/routes";

/** The block component. */
describe("PromoBanner", () => {
  /** The cta's event reaches `onEvent` as declared; the block decides nothing. */
  it("dispatches the cta event through onEvent", async () => {
    const onEvent = vi.fn();
    const route: RouteKey = "create_order";
    const event = { verb: "navigate" as const, route };
    render(
      <PromoBanner headline="Ramadan offers" cta={{ label: "Order", event }} onEvent={onEvent} />,
    );
    await userEvent.press(screen.getByRole("button", { name: "Order" }));
    expect(onEvent).toHaveBeenCalledWith(event);
  });
});
