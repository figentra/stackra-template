/**
 * Stackra file contract:
 * Purpose: `PaletteState`: what `usePalette` returns to the palette dialog.
 * Boundary: a type only, in the app's `types/` group; the intent match is the clients package's
 *           type, so a proposed action is always a generated descriptor.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: one declaration
 *                     per file), ADR 0245, ADR 0139
 */
import type { IntentMatch } from "@stackra/clients/react";
import type { ShortcutItem } from "@stackra/shortcuts/react";
import type { PaletteGroup } from "#src/types/palette-group.type";

/** The dialog's open state, the typed text, the grouped entries and the two ways to run one. */
export interface PaletteState {
  /** Whether the dialog is showing. */
  readonly isOpen: boolean;
  /** Opens or closes the dialog; closing also clears the query. */
  readonly setOpen: (open: boolean) => void;
  /** The text in the input, shared with the intent router. */
  readonly query: string;
  /** Updates the text in the input. */
  readonly setQuery: (query: string) => void;
  /** Entries grouped by their `group` i18n key; HeroUI's `Command` filters by `textValue`. */
  readonly groups: readonly PaletteGroup[];
  /** A proposed action call from free text, or `null`; shown as its own group with a confirm. */
  readonly intent: IntentMatch | null;
  /** Closes the dialog, then runs the chosen shortcut through the shortcuts module. */
  readonly run: (shortcut: ShortcutItem) => Promise<void>;
  /** Runs the proposed action with the extracted input through its declared confirmation. */
  readonly confirmIntent: () => Promise<void>;
}
