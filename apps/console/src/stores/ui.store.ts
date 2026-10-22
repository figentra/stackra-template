/**
 * Stackra file contract:
 * Purpose: the console's app-wide UI state: sidebar collapsed and table density, persisted per
 *          device.
 * Boundary: a `@Store` class on @stackra/state (ADR 0079): methods are the only writers, getters
 *           the derived values. Nothing server-owned is copied here; a preference that must follow
 *           the user across devices is a setting.
 * Runtime: browser
 * Governing contract: ADR 0079, ADR 0256 (prefs store)
 */
import { Store, StoreBase } from "@stackra/state";
import { StorageArea } from "@stackra/storage";
import { Density } from "#src/enums/density.enum";

/** The persisted shape; `density` is stored as its code and rebuilt as the case on read. */
interface UiState {
  readonly sidebarCollapsed: boolean;
  readonly density: Density;
}

/** App-wide console UI state: sidebar collapsed and table density, persisted per device. */
@Store({ key: "ui", persist: StorageArea.Prefs })
export class UiStore extends StoreBase<UiState> {
  /** Expanded sidebar, comfortable rows: what a first visit on a device shows. */
  initial: UiState = { sidebarCollapsed: false, density: Density.Comfortable };

  /** The shell's keyboard shortcut, the rail button and the desktop menu all call this. */
  toggleSidebar(): void {
    this.set((s) => ({ ...s, sidebarCollapsed: !s.sidebarCollapsed }));
  }

  /**
   * Sets the sidebar from the layout's own open/close event, so the store and the layout never
   * disagree.
   */
  setSidebarCollapsed(collapsed: boolean): void {
    this.set((s) => ({ ...s, sidebarCollapsed: collapsed }));
  }

  /** Applied at once by the settings page; the tables re-read the class on the next render. */
  setDensity(density: Density): void {
    this.set((s) => ({ ...s, density }));
  }

  /**
   * The CSS class the shell puts on `<main>` so the panel's tables pick the density up without
   * props.
   */
  get densityClass(): string {
    return this.state.density.meta.className;
  }
}
