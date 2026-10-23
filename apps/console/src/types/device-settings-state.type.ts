/**
 * Stackra file contract:
 * Purpose: `DeviceSettingsState`: what `useDeviceSettings` returns to the settings page's device
 *          and privacy tabs.
 * Boundary: a type only, in the app's `types/` group; the values are the `DevicePrefs` shape.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: one declaration
 *                     per file), ADR 0256
 */
import type { DevicePrefs } from "#src/schemas/device-prefs.schema";

/** One save for both tabs and whether local notifications can be offered at all. */
export interface DeviceSettingsState {
  /** Resolves once every side effect has run. */
  readonly save: (values: DevicePrefs) => Promise<void>;
  /** Whether this target can show local notifications; the page disables the switch otherwise. */
  readonly canNotify: boolean;
}
