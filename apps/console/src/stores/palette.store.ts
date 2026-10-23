/**
 * Stackra file contract:
 * Purpose: the palette's own state: open flag and the typed query. Session-only, never persisted.
 * Boundary: a store without `persist`, so the bare base; the open-palette shortcut and the Escape
 *           key both move it. Fields are the state; `set` is the only writer. Key derived
 *           (`console.palette`).
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0079
 */
import { Store } from "@stackra/state";

/** Palette state: whether the dialog shows and what the user typed into it. */
export class PaletteStore extends Store {
  /** Closed until the shortcut or the top-bar button opens it. */
  isOpen = false;

  /** The typed text; empty until the user types. */
  query = "";

  /** Opens the dialog and keeps whatever was typed before it was last hidden. */
  open(): void {
    this.set({ isOpen: true });
  }

  /** Closes and clears, so a reopened palette starts empty. */
  close(): void {
    this.set({
      isOpen: false,
      query: "",
    });
  }

  /** Mirrors the input so the intent router sees the same text the list filters by. */
  setQuery(query: string): void {
    this.set({ query });
  }
}
