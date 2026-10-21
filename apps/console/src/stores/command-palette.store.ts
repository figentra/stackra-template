/**
 * Stackra file contract:
 * Purpose: the palette's own state: open flag and the typed query. Session-only, never persisted.
 * Boundary: a `@Store` without `persist`; the open-palette command and the Escape key both move it.
 * Runtime: browser
 * Governing contract: ADR 0079
 */
import { Store, StoreBase } from "@stackra/state";

/** Whether the dialog shows and what the user typed into it. */
interface PaletteState {
  readonly isOpen: boolean;
  readonly query: string;
}

/** Command palette state: open flag and typed query, session-only and never persisted. */
@Store({ key: "command_palette" })
export class CommandPaletteStore extends StoreBase<PaletteState> {
  /** Closed and empty until the shortcut or the top-bar button opens it. */
  initial: PaletteState = { isOpen: false, query: "" };

  /** Opens the dialog and keeps whatever was typed before it was last hidden. */
  open(): void {
    this.set((s) => ({ ...s, isOpen: true }));
  }

  /** Closes and clears, so a reopened palette starts empty. */
  close(): void {
    this.set({ isOpen: false, query: "" });
  }

  /** Mirrors the input so the intent router sees the same text the list filters by. */
  setQuery(query: string): void {
    this.set((s) => ({ ...s, query }));
  }
}
