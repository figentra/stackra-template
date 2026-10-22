/**
 * Stackra file contract:
 * Purpose: a granted token is registered with the devices module with the platform case and the
 *          locale; a denial registers nothing; a tapped notification's URL is opened.
 * Boundary: unit tier; the platform fake's push port grants or denies; the client fake records the
 *           call.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0062, ADR 0235
 */
import { fakeClient } from "@stackra/clients/testing";
import { fakeSession } from "@stackra/identity/testing";
import { fakePlatform } from "@stackra/platform/testing";
import { describe, expect, it } from "@stackra/testing";
import { act, render, waitFor } from "@stackra/testing/native";
import { SessionStatus } from "@stackra/identity";
import { PushContextProvider } from "#src/providers/push";
import { Devices } from "#stackra/clients";

const session = fakeSession({ status: SessionStatus.SignedIn, tenants: 1 });
const tenant = session.user.tenants[0].tenantId;

/** The registration effect. */
describe("PushContextProvider", () => {
  /** Granted: one registration with the install id, the platform case, the token and the locale. */
  it("registers a granted device with the devices module", async () => {
    const devices = fakeClient(Devices, (fake) =>
      fake.actions.RegisterDevice.returns({ deviceId: "dev_1" }),
    );
    const platform = fakePlatform({
      os: "ios",
      push: { permission: "granted", token: "ExponentPushToken[abc]", installationId: "inst_1" },
    });
    render(<PushContextProvider>{null}</PushContextProvider>, {
      locale: "ar",
      session,
      tenant,
      clients: [devices],
      platform,
    });
    await waitFor(() =>
      expect(devices.called(Devices.actions.RegisterDevice)).toEqual([
        {
          installationId: "inst_1",
          platform: Devices.enums.DevicePlatform.Ios,
          pushToken: "ExponentPushToken[abc]",
          locale: "ar",
        },
      ]),
    );
  });

  /** Denied: nothing sent; a tapped notification still opens its deep link. */
  it("sends nothing after a denial and opens a tapped notification's url", async () => {
    const devices = fakeClient(Devices);
    const platform = fakePlatform({ push: { permission: "denied" } });
    const url = "acme://orders/ord_01H2J3K4L5M6N7P8Q9R0ABCDEF";
    const { linking } = render(<PushContextProvider>{null}</PushContextProvider>, {
      session,
      tenant,
      clients: [devices],
      platform,
    });
    await act(() => platform.push.emitOpen({ url }));
    expect(devices.called(Devices.actions.RegisterDevice)).toEqual([]);
    expect(linking.openURL).toHaveBeenCalledWith(url);
  });
});
