/**
 * Stackra file contract:
 * Purpose: proves the indicator names the realtime status in words, in English and Arabic, so a
 *          dropped socket is announced rather than shown only as a colour.
 * Boundary: unit tier, jsdom; the realtime connection is the render option's fake.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0225, ADR 0007
 */
import { RealtimeStatus } from "@stackra/realtime";
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { ConnectionIndicator } from "#src/components/connection-indicator";

/** Guards the live-updates indicator in the top bar. */
describe(ConnectionIndicator, () => {
  /** A live connection reads as live. */
  it("says the connection is live", () => {
    render(<ConnectionIndicator />, {
      locale: "en",
      realtime: { status: RealtimeStatus.Connected },
    });
    expect(screen.getByRole("status")).toHaveTextContent("Live");
  });

  /** A lost connection must be announced in the user's language. */
  it("announces a lost connection in Arabic", () => {
    render(<ConnectionIndicator />, {
      locale: "ar",
      realtime: { status: RealtimeStatus.Disconnected },
    });
    expect(screen.getByRole("status")).toHaveTextContent("غير متصل بالتحديثات");
  });
});
