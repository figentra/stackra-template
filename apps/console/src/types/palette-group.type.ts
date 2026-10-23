/**
 * Stackra file contract:
 * Purpose: `PaletteGroup`: one heading of the command palette and the shortcuts under it.
 * Boundary: a type only, in the app's `types/` group; built by `usePalette` from the shortcuts
 *           package's list.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: one declaration
 *                     per file), ADR 0245
 */
import type { ShortcutItem } from "@stackra/shortcuts/react";

/** One group of the palette: its heading key and its entries, in declaration order. */
export interface PaletteGroup {
  /** The `group` i18n key the entries share. */
  readonly group: string;
  /** The entries of the group. */
  readonly shortcuts: readonly ShortcutItem[];
}
