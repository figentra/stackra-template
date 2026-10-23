/**
 * Stackra file contract:
 * Purpose: the banner is silent online with an empty queue, names the pending count once online
 *          again, and shows the offline text with no retry while offline.
 * Boundary: unit tier; the platform network port and the queue are the testing fakes.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0059
 */
import { fakePlatform } from "@stackra/platform/testing";
import { fakeQueue } from "@stackra/query/testing";
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/native";
import { OfflineBanner } from "#src/components/offline-banner";

/** The banner's three faces. */
describe("OfflineBanner", () => {
  /** Nothing to say: nothing rendered. */
  it("renders nothing when online with an empty queue", () => {
    render(<OfflineBanner />, {
      platform: fakePlatform({ network: { isOnline: true } }),
      queue: fakeQueue({ pending: 0 }),
    });
    expect(screen.queryByTestId("offline-banner")).toBeNull();
  });

  /** Back online with queued writes: the count and a manual replay. */
  it("offers a retry once back online with queued writes", () => {
    render(<OfflineBanner />, {
      locale: "en",
      platform: fakePlatform({ network: { isOnline: true } }),
      queue: fakeQueue({ pending: 2 }),
    });
    expect(screen.getByText("2 changes waiting to send")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Send now" })).toBeTruthy();
  });

  /** Offline: the line, no retry (a replay would fail at once). */
  it("shows the offline line without a retry while offline", () => {
    render(<OfflineBanner />, {
      locale: "ar",
      platform: fakePlatform({ network: { isOnline: false } }),
      queue: fakeQueue({ pending: 1 }),
    });
    expect(screen.getByText("أنت غير متصل. ستُرسل التغييرات عند عودة الاتصال.")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
