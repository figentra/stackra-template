/**
 * Stackra file contract:
 * Purpose: saving the device and privacy tabs: asks the platform for the notification permission
 *          when wanted (a typed refusal flips the switch back with a toast), records the analytics
 *          consent, writes the prefs store, and applies scheme, locale and density at once.
 * Boundary: one component's hook; never reaches the server. Scheme goes through `@stackra/theming`,
 *           consent through `@stackra/consent` (which starts or stops the analytics driver),
 *           density through the UI store.
 * Runtime: browser
 * Governing contract: ADR 0250 (capability refusal), ADR 0256 (prefs), ADR 0079
 */
import { ConsentCategory } from "@stackra/consent";
import { useConsent } from "@stackra/consent/react";
import { useLocale, useTranslation } from "@stackra/i18n/react";
import { Capability } from "@stackra/platform";
import { usePlatform } from "@stackra/platform/react";
import { useStore } from "@stackra/state/react";
import { usePrefs } from "@stackra/storage/react";
import { useColorScheme } from "@stackra/theming/react";
import { toast } from "@stackra/ui";
import { I18n } from "#stackra/i18n";
import { DevicePrefs } from "#src/schemas/device-prefs.schema";
import { UiStore } from "#src/stores/ui.store";

/** What the hook returns. */
export interface DeviceSettingsState {
  /** Resolves once every side effect has run. */
  readonly save: (values: DevicePrefs) => Promise<void>;
  /**
   * Whether this target can show local notifications at all; the page disables the switch
   * otherwise.
   */
  readonly canNotify: boolean;
}

/** One save for both tabs, so the stored prefs are always a whole, valid `DevicePrefs`. */
export function useDeviceSettings(): DeviceSettingsState {
  const { t } = useTranslation();
  const platform = usePlatform();
  const prefs = usePrefs();
  const { setScheme } = useColorScheme();
  const { setLocale } = useLocale();
  const consent = useConsent(ConsentCategory.Analytics);
  const ui = useStore(UiStore);

  const save = async (input: DevicePrefs) => {
    let values = input;
    if (values.localNotifications) {
      const granted = await platform.notifications.requestPermission();
      if (!granted.ok) {
        toast.warning(t(I18n.console.capabilities[granted.error.code]));
        values = { ...values, localNotifications: false };
      }
    }
    if (values.analyticsConsent) consent.grant();
    else consent.deny();
    prefs.write(DevicePrefs, values);
    setScheme(values.scheme);
    setLocale(values.locale);
    ui.setDensity(values.density);
    toast.success(t(I18n.console.settings.saved_device));
  };

  return { save, canNotify: platform.has(Capability.LocalNotifications) };
}
