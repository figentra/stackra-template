/**
 * Stackra file contract:
 * Purpose: `console.toggle_sidebar`: collapses or expands the sidebar from the keyboard, the
 *          desktop menu and the palette.
 * Boundary: a Shortcut class and the only owner of `mod+b` (the shell turns HeroUI's own binding
 *           off, so one key press flips the sidebar once); the key and the label
 *           (`console::shortcuts.toggle_sidebar.label`) are derived; the state is the UI store's.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 14, 16, 17 and 23), ADR 0245, ADR 0079
 */
import { Shortcut } from "@stackra/shortcuts";
import { I18n } from "#stackra/i18n";
import type { UiStore } from "#src/stores/ui.store";

/** Collapses or expands the sidebar; bound to `mod+b`. */
export class ToggleSidebarShortcut extends Shortcut({
  keys: "mod+b",
  group: I18n.console.palette.group_app,
}) {
  /** @param ui - the UI store; the layout re-renders from its flag. */
  constructor(private readonly ui: UiStore) {
    super();
  }

  /** Flips the store's flag. */
  run(): void {
    this.ui.toggleSidebar();
  }
}
