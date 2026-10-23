/**
 * Stackra file contract:
 * Purpose: the palette's data: the gate-filtered shortcut list grouped for display, free-text
 *          intent routing, `run`.
 * Boundary: shortcuts come from the shortcuts package (the Shortcut classes of `shortcuts/`, the
 *           generated navigation and action-intent entries; already filtered by permission, flag
 *           and capability). Free text that matches no label goes to the intent router, which
 *           proposes an action the user confirms; the hook never runs an action from text on its
 *           own. The result type is `types/palette-state.type.ts`.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 23), ADR 0245 (intents over actions), ADR 0139 (an action
 *                     runs with its declared confirmation)
 */
import { useMemo } from "react";
import { useIntentRouter } from "@stackra/clients/react";
import { useActionRunner } from "@stackra/panel/react";
import { useRunShortcut, useShortcuts, type ShortcutItem } from "@stackra/shortcuts/react";
import { useStore } from "@stackra/state/react";
import { PaletteStore } from "#src/stores/palette.store";
import type { PaletteState } from "#src/types/palette-state.type";

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
