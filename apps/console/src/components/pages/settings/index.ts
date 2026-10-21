/**
 * Stackra file contract:
 * Purpose: the page folder's barrel: the settings page and its one hook.
 * Boundary: explicit exports only.
 * Runtime: browser
 * Governing contract: ADR 0128 d2
 */
export { SettingsPage } from "./settings";
export { useDeviceSettings } from "./use-device-settings";
export type { DeviceSettingsState } from "./use-device-settings";
