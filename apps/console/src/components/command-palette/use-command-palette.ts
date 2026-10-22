/**
 * Stackra file contract:
 * Purpose: the palette's data: the gate-filtered command list grouped for display, free-text intent
 *          routing, `run`.
 * Boundary: commands come from the kbd package (the `@Command` classes of `commands/`, the
 *           generated navigation and action-intent commands; already filtered by permission, flag
 *           and capability). Free text that matches no label goes to the intent router, which
 *           proposes an action the user confirms; the hook never runs an action from text on its
 *           own.
 * Runtime: browser
 * Governing contract: ADR 0245 (intents over actions), ADR 0139 (an action runs with its declared
 *                     confirmation)
 */
import { useMemo } from "react";
import { useCommands, useRunCommand, type CommandItem } from "@stackra/kbd/react";
import { useIntentRouter, type IntentMatch } from "@stackra/clients/react";
import { useActionRunner } from "@stackra/panel/react";
import { useStore } from "@stackra/state/react";
import { CommandPaletteStore } from "#src/stores/command-palette.store";

/** What the palette renders. */
export interface CommandPaletteState {
  /** Whether the dialog is showing. */
  readonly isOpen: boolean;
  /** Opens or closes the dialog; closing also clears the query. */
  readonly setOpen: (open: boolean) => void;
  /** The text in the input, shared with the intent router. */
  readonly query: string;
  /** Updates the text in the input. */
  readonly setQuery: (query: string) => void;
  /**
   * Commands grouped by their `group` i18n key, in declaration order; HeroUI's `Command` filters by
   * `textValue`.
   */
  readonly groups: ReadonlyArray<{
    readonly group: string;
    readonly commands: readonly CommandItem[];
  }>;
  /** A proposed action call from free text, or `null`; shown as its own group with a confirm. */
  readonly intent: IntentMatch | null;
  /** Closes the dialog, then runs the chosen command through the kbd module. */
  readonly run: (command: CommandItem) => Promise<void>;
  /** Runs the proposed action with the extracted input through the declared UX. */
  readonly confirmIntent: () => Promise<void>;
}

/** The palette's state and behaviour; one instance per shell. */
export function useCommandPalette(): CommandPaletteState {
  const palette = useStore(CommandPaletteStore);
  const commands = useCommands();
  const runCommand = useRunCommand();
  const runAction = useActionRunner();
  const intent = useIntentRouter(palette.state.query.length >= 3 ? palette.state.query : "");

  const groups = useMemo(() => {
    const byGroup = new Map<string, CommandItem[]>();
    for (const command of commands)
      byGroup.set(command.group, [...(byGroup.get(command.group) ?? []), command]);
    return [...byGroup].map(([group, list]) => ({ group, commands: list }));
  }, [commands]);

  const setOpen = (open: boolean) => (open ? palette.open() : palette.close());

  return {
    isOpen: palette.state.isOpen,
    setOpen,
    query: palette.state.query,
    setQuery: (query) => palette.setQuery(query),
    groups,
    intent,
    run: async (command) => {
      setOpen(false);
      await runCommand(command);
    },
    confirmIntent: async () => {
      if (!intent) return;
      setOpen(false);
      // the action's declared confirmation still applies
      await runAction(intent.action, intent.input);
    },
  };
}
