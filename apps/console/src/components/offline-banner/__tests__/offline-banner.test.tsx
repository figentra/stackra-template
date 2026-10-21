/**
 * Stackra file contract:
 * Purpose: the banner appears only offline and counts the queue, with Arabic plural forms.
 * Boundary: unit tier, jsdom; the platform network signal and the queue are testing fakes.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0252
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { OfflineBanner } from "#src/components/offline-banner";

/** Guards the offline indicator that tells staff their changes are not yet synced. */
describe(OfflineBanner, () => {
  /** The banner must not show while online, or staff would distrust live data. */
  it("is absent while online", () => {
    render(<OfflineBanner />, { locale: "en", platform: { online: true } });
    expect(screen.queryByRole("status")).toBeNull();
  });

  /** The queued count needs correct Arabic plural forms so the message is grammatical. */
  it("counts queued changes, pluralised in Arabic", () => {
    render(<OfflineBanner />, {
      locale: "ar",
      platform: { online: false },
      queue: [{ key: "orders.order.create" }, { key: "orders.order.create" }],
    });
    expect(screen.getByRole("status")).toHaveTextContent("تغييران بانتظار المزامنة");
  });
});
