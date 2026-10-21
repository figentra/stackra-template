/**
 * Stackra file contract:
 * Purpose: proves the realtime provider connects only for a signed-in session and joins the active
 *          tenant, so a signed-out boot opens no socket.
 * Boundary: unit tier; `hydrateProvider` runs the class's `hydrate` with the realtime transport's
 *           testing fake.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0225, ADR 0007
 */
import { describe, expect, it } from "@stackra/testing";
import { fakeRealtimeTransport } from "@stackra/realtime/testing";
import { hydrateProvider } from "@stackra/testing/react";
import { RealtimeProvider } from "#src/providers/realtime/realtime.provider";

/** Guards the one socket the console's live tiles and inbox depend on. */
describe(RealtimeProvider, () => {
  /** A signed-in user joins the tenant they are working in, never another. */
  it("connects for a session and joins the active tenant", async () => {
    const transport = fakeRealtimeTransport();
    await hydrateProvider(RealtimeProvider, {
      session: { userId: "usr_01J9Z3K4M5N6P7Q8R9S0T1V2W3" },
      tenant: { tenantId: "ten_01J9Z3K4M5N6P7Q8R9S0T1V2W3" },
      replace: [transport],
    });
    expect(transport.connections()).toEqual([
      expect.objectContaining({ tenantId: "ten_01J9Z3K4M5N6P7Q8R9S0T1V2W3" }),
    ]);
  });

  /** Signed out there is nothing to receive, so no socket is opened. */
  it("opens no connection when signed out", async () => {
    const transport = fakeRealtimeTransport();
    await hydrateProvider(RealtimeProvider, { session: null, replace: [transport] });
    expect(transport.connections()).toEqual([]);
  });
});
