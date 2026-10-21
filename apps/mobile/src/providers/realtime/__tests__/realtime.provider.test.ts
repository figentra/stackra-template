/**
 * Stackra file contract:
 * Purpose: `hydrate` connects to the env's realtime origin signed in, and connects nothing signed
 *          out.
 * Boundary: unit tier; the realtime transport fake records connections; `runHydrate` drives the
 *           class with env and driver overrides.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0225
 */
import { fakeSession } from "@stackra/identity/testing";
import { runHydrate } from "@stackra/navigation/testing";
import { fakeRealtimeTransport } from "@stackra/realtime/testing";
import { describe, expect, it } from "@stackra/testing";
import { SessionStatus } from "@stackra/identity";
import { RealtimeProvider } from "#src/providers/realtime";

const origin = "ws://realtime.test/realtime";

/** The connect-before-mount half of realtime. */
describe("RealtimeProvider", () => {
  /** Signed in: one connection to the configured origin, handed to the context. */
  it("connects to the env's realtime origin", async () => {
    const transport = fakeRealtimeTransport();
    const { value } = await runHydrate(RealtimeProvider, {
      session: fakeSession({ status: SessionStatus.SignedIn }),
      env: { realtimeOrigin: origin },
      replace: [transport],
    });
    expect(transport.connections().map((c) => c.origin)).toEqual([origin]);
    expect(value).toBe(transport.connections()[0]);
  });

  /** Signed out: no socket, so nothing leaks before sign-in. */
  it("connects nothing signed out", async () => {
    const transport = fakeRealtimeTransport();
    const { value } = await runHydrate(RealtimeProvider, {
      session: fakeSession({ status: SessionStatus.SignedOut }),
      replace: [transport],
    });
    expect(value).toBeNull();
    expect(transport.connections()).toEqual([]);
  });
});
