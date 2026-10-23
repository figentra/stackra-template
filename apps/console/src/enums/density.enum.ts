/**
 * Stackra file contract:
 * Purpose: the row density of every table the panel renders, with the CSS hook of each case.
 * Boundary: an `Enum.of` value plus the type of the same name; app-local (only the console offers
 *           density) and persisted by its code. Labels are the derived i18n keys
 *           `console::enums.density.<code>`; the class name is the meta the shell puts on `<main>`.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 4, 16 and 20), ADR 0231 (snake_case codes)
 */
import { Enum } from "@stackra/contracts";

/**
 * One case per density; cases are plain codes, so they compare with `===`.
 *
 * @example
 * Enum.meta(Density, Density.Compact).className; // "panel-compact"
 */
export const Density = Enum.of({
  Comfortable: ["comfortable", { className: "panel-comfortable" }],
  Compact: ["compact", { className: "panel-compact" }],
});

/** One of the codes above. */
export type Density = Enum.Value<typeof Density>;
