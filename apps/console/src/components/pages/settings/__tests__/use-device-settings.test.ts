/**
 * Stackra file contract:
 * Purpose: proves saving device prefs applies the scheme at once, records the analytics consent,
 *          and a refused notification capability flips the switch back with the typed refusal's
 *          toast instead of persisting a permission the device will not honour.
 * Boundary: unit tier, jsdom; prefs, platform, consent and toasts are the testing fakes.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0250, ADR 0071, ADR 0007
 */
import { ConsentCategory } from "@stackra/consent";
import { Locale } from "@stackra/i18n";
import { Capability } from "@stackra/platform";
import { describe, expect, it } from "@stackra/testing";
import { act, renderHook } from "@stackra/testing/react";
import { ColorScheme } from "@stackra/theming";
import { useDeviceSettings } from "#src/components/pages/settings";
import { Density } from "#src/enums/density.enum";

/** A whole, valid set of device prefs the cases vary. */
const PREFS = {
  scheme: ColorScheme.Dark,
  locale: Locale.En,
  density: Density.Compact,
  localNotifications: false,
  analyticsConsent: true,
};

/** Guards per-device preferences that apply immediately and persist locally. */
describe(useDeviceSettings, () => {
  /**
   * The scheme must be visible before the toast, and the consent choice must reach the consent
   * store.
   */
  it("applies the scheme, records consent and persists the prefs on save", async () => {
    const { result, prefs, consent } = renderHook(() => useDeviceSettings(), {
      platform: { capabilities: [] },
    });
    await act(() => result.current.save(PREFS));
    expect(document.documentElement.getAttribute("data-theme")).toBe(ColorScheme.Dark.value);
    expect(prefs.get("device")).toMatchObject({ density: Density.Compact.value });
    expect(consent.status(ConsentCategory.Analytics)).toBe("granted");
  });

  /**
   * A denied permission is a typed refusal (ADR 0250), never an exception; the stored value must
   * say `false`.
   */
  it("turns notifications back off when the platform refuses the permission", async () => {
    const { result, prefs, toasts } = renderHook(() => useDeviceSettings(), {
      platform: {
        capabilities: [Capability.LocalNotifications],
        permissions: { [Capability.LocalNotifications.value]: "denied" },
      },
    });
    await act(() => result.current.save({ ...PREFS, localNotifications: true }));
    expect(prefs.get("device")).toMatchObject({ localNotifications: false });
    expect(toasts.last()?.text).toBe("Notifications were not allowed by the browser.");
  });
});
