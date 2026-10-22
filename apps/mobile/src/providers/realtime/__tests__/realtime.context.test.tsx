/**
 * Stackra file contract:
 * Purpose: the connection is suspended after the grace period in the background and resumed on
 *          foreground.
 * Boundary: unit tier; the platform fake drives the app state; the realtime fake records suspend
 *           and resume.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0225, ADR 0250
 */
import { fakePlatform } from "@stackra/platform/testing";
import { fakeRealtime } from "@stackra/realtime/testing";
import { describe, expect, it } from "@stackra/testing";
import { act, render } from "@stackra/testing/native";
import { RealtimeConfig } from "#src/config/realtime.config";
import { RealtimeContextProvider } from "#src/providers/realtime";

/** The phone's socket lifecycle. */
describe("RealtimeContextProvider", () => {
  /**
   * Background then foreground: suspend with the configured grace, then resume, so subscriptions
   * survive.
   */
  it("suspends in the background and resumes on foreground", async () => {
    const connection = fakeRealtime().connect();
    const platform = fakePlatform({ appState: { isForeground: true } });
    render(<RealtimeContextProvider value={connection}>{null}</RealtimeContextProvider>, {
      platform,
    });
    await act(() => platform.appState.emit({ isForeground: false }));
    expect(connection.suspended).toEqual([
      { afterSeconds: new RealtimeConfig().backgroundGraceSeconds },
    ]);
    await act(() => platform.appState.emit({ isForeground: true }));
    expect(connection.resumed).toBe(1);
  });
});
