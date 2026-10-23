/**
 * Stackra file contract:
 * Purpose: the palette's data: the gate-filtered shortcut list grouped for display, free-text
 *          intent routing, `run`.
 * Boundary: shortcuts come from the shortcuts package (the Shortcut classes of `shortcuts/`, the
 *           generated navigation and action-intent entries; already filtered by permission, flag
 *           and capability). Free text that matches no label goes to the intent router, which
 *           proposes an action the user confirms; the hook never runs an action from text on its
 *           own.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 23), ADR 0245 (intents over actions), ADR 0139 (an action
 *                     runs with its declared confirmation)
 */
import { useMemo } from "react";
import { useIntentRouter, type IntentMatch } from "@stackra/clients/react";
import { useActionRunner } from "@stackra/panel/react";
import { useRunShortcut, useShortcuts, type ShortcutItem } from "@stackra/shortcuts/react";
import { useStore } from "@stackra/state/react";
import { PaletteStore } from "#src/stores/palette.store";

/** One group of the palette: its heading key and its entries, in declaration order. */
export interface PaletteGroup {
  /** The `group` i18n key the entries share. */
  readonly group: string;
  /** The entries of the group. */
  readonly shortcuts: readonly ShortcutItem[];
}

/** What the palette renders. */
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
  /** Runs the proposed action with the extracted input through the declared UX. */
  readonly confirmIntent: () => Promise<void>;
}

/** The palette's state and behaviour; one instance per shell. */
export function usePalette(): PaletteState {
  const palette = useStore(PaletteStore);
  const shortcuts = useShortcuts();
  const runShortcut = useRunShortcut();
  const runAction = useActionRunner();
  const intent = useIntentRouter(palette.query.length >= 3 ? palette.query : "");

  const groups = useMemo(() => {
    const byGroup = new Map<string, ShortcutItem[]>();
    for (const shortcut of shortcuts)
      byGroup.set(shortcut.group, [...(byGroup.get(shortcut.group) ?? []), shortcut]);
    return [...byGroup].map(([group, list]) => ({ group, shortcuts: list }));
  }, [shortcuts]);

  const setOpen = (open: boolean) => (open ? palette.open() : palette.close());

  return {
    isOpen: palette.isOpen,
    setOpen,
    query: palette.query,
    setQuery: (query) => palette.setQuery(query),
    groups,
    intent,
    run: async (shortcut) => {
      setOpen(false);
      await runShortcut(shortcut);
    },
    confirmIntent: async () => {
      if (!intent) return;
      setOpen(false);
      // the action's declared confirmation still applies
      await runAction(intent.action, intent.input);
    },
  };
}
