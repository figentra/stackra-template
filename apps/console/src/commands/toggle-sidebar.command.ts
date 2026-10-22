/**
 * Stackra file contract:
 * Purpose: `console.sidebar.toggle`: collapses or expands the sidebar from the keyboard, the
 *          desktop menu and the palette.
 * Boundary: a `@Command` class and the only owner of `mod+b` (the shell turns HeroUI's own binding
 *           off, so one key press flips the sidebar once); the state is the UI store's.
 * Runtime: browser
 * Governing contract: ADR 0245, ADR 0079
 */
import { Command, type CommandContext } from "@stackra/kbd";
import { I18n } from "#stackra/i18n";
import { UiStore } from "#src/stores/ui.store";

/** Command `console.sidebar.toggle`: collapses or expands the sidebar. */
@Command({
  key: "sidebar.toggle",
  label: I18n.console.commands.sidebar,
  shortcut: "mod+b",
  group: I18n.console.commands.group_app,
})
export class ToggleSidebarCommand {
  /** Flips the store's flag; the layout re-renders from it. */
  run(ctx: CommandContext) {
    ctx.store(UiStore).toggleSidebar();
  }
}
