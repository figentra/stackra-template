/**
 * Stackra file contract:
 * Purpose: the sections of the console's settings page, one tab each.
 * Boundary: an `Enum.of` value plus the type of the same name; app-local (only the settings page
 *           shows these tabs). Each code is the tab's id; the labels are the derived i18n keys
 *           `console::enums.settings_tab.<code>`. The page leaves out the tenant tab when its loader
 *           returned no tenant values.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 4, 16 and 20), ADR 0231 (snake_case codes)
 */
import { Enum } from "@stackra/contracts";

/** One case per settings tab, in display order; cases are plain codes, compared with `===`. */
export const SettingsTab = Enum.of({
  /** Preferences of this device: theme, language, density, local notifications. */
  Device: "device",
  /** The analytics consent and the link to the notification preferences. */
  Privacy: "privacy",
  /** The tenant's settings, shown only to someone who may edit them. */
  Tenant: "tenant",
});

/** One of the codes above. */
export type SettingsTab = Enum.Value<typeof SettingsTab>;
