/**
 * Stackra file contract:
 * Purpose: the settings page's device and privacy tabs: per-device choices kept in the `prefs`
 *          store, never sent to the server.
 * Boundary: one schema class; scheme, locale and density are the class enums of their owning
 *           packages, and the analytics choice is the consent store's input, not a copy of it.
 * Runtime: browser
 * Governing contract: ADR 0256 (prefs store), ADR 0095
 */
import { Locale } from "@stackra/i18n";
import { Schema, z } from "@stackra/schema";
import { ColorScheme } from "@stackra/theming";
import { Density } from "#src/enums/density.enum";

/**
 * Theme, language, density, local notifications and analytics consent on this device. Keyed
 * `device` in prefs.
 */
export class DevicePrefs extends Schema(
  z.object({
    scheme: ColorScheme.schema.default(ColorScheme.System),
    locale: Locale.schema.default(Locale.En),
    density: Density.schema.default(Density.Comfortable),
    localNotifications: z.boolean().default(false),
    analyticsConsent: z.boolean().default(false),
  }),
  { key: "device" },
) {}
