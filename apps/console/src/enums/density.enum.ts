/**
 * Stackra file contract:
 * Purpose: the row density of every table the panel renders, with the settings label and the CSS
 *          hook of each case.
 * Boundary: an app-local class enum (only the console offers density); persisted by its code,
 *           compared by identity.
 * Runtime: browser
 * Governing contract: ADR 0231 (snake_case codes)
 */
import { Enum } from "@stackra/schema";
import { I18n } from "#stackra/i18n";

/** `label` is the settings page's option text; `className` is what the shell puts on `<main>`. */
export class Density extends Enum<Density> {
  /** The default spacing. */
  static readonly Comfortable = Density.case("comfortable", {
    label: I18n.console.settings.density_comfortable,
    className: "panel-comfortable",
  });
  /** Tighter rows for long tables on a till screen. */
  static readonly Compact = Density.case("compact", {
    label: I18n.console.settings.density_compact,
    className: "panel-compact",
  });
}
