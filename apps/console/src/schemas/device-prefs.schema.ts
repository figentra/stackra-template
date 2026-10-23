/**
 * Stackra file contract:
 * Purpose: the settings page's device and privacy tabs: per-device choices kept in the `prefs`
 *          store (under `console.device_prefs`), never sent to the server.
 * Boundary: a shape class shared by the settings route, its page and its hook. Scheme and locale
 *           are the enums of their owning packages, density the console's; the analytics choice is
 *           the consent store's input, not a copy of it. The types are the rules and the
 *           initializers the defaults; gen compiles them (no Zod here).
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 4 and 8), ADR 0256 (prefs store)
 */
import { Locale } from "@stackra/i18n";
import { ColorScheme } from "@stackra/theming";
import { Schema } from "@stackra/validation";
import { Density } from "#src/enums/density.enum";

/** Theme, language, density, local notifications and the consent switches on this device. */
export class DevicePrefs extends Schema {
  /** The colour scheme; `system` follows the operating system. */
  scheme: ColorScheme = ColorScheme.System;

  /** The interface language. */
  locale: Locale = Locale.En;

  /** Row density of the panel's tables. */
  density: Density = Density.Comfortable;

  /** Show local notifications while the console is open. */
  localNotifications = false;

  /** Share usage analytics; saving records the consent decision from it. */
  analyticsConsent = false;

  /** Replay the session around an error; saving records the crash-replay consent from it. */
  crashReplayConsent = false;
}
