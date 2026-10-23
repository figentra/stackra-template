/**
 * Stackra file contract:
 * Purpose: the console's app-wide UI state: sidebar collapsed and table density, persisted per
 *          device.
 * Boundary: a store class on @stackra/state (ADR 0079): the fields are the state, `set` the only
 *           writer, methods the only callers of `set`, getters the derived values. Nothing
 *           server-owned is copied here; a preference that must follow the user across devices is a
 *           setting. Persisted in the prefs store under the derived key `console.ui`.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0079, ADR 0256 (prefs store)
 */
import { Store } from "@stackra/state";
import { StorageArea } from "@stackra/storage";
import { Enum } from "@stackra/validation";
import { Density } from "#src/enums/density.enum";

/** App-wide console UI state: sidebar collapsed and table density, persisted per device. */
export class UiStore extends Store({ persist: StorageArea.Prefs }) {
  /** Expanded on a first visit on a device. */
  sidebarCollapsed = false;

  /** Comfortable rows on a first visit on a device. */
  density: Density = Density.Comfortable;

  /** The shell's keyboard shortcut, the rail button and the desktop menu all call this. */
  toggleSidebar(): void {
    this.set({ sidebarCollapsed: !this.sidebarCollapsed });
  }

  /**
   * Sets the sidebar from the layout's own open/close event, so the store and the layout never
   * disagree.
   */
  setSidebarCollapsed(collapsed: boolean): void {
    this.set({ sidebarCollapsed: collapsed });
  }

  /** Applied at once by the settings page; the tables re-read the class on the next render. */
  setDensity(density: Density): void {
    this.set({ density });
  }

  /**
   * The CSS class the shell puts on `<main>` so the panel's tables pick the density up without
   * props.
   */
  get densityClass(): string {
    return Enum.meta(Density, this.density).className;
  }
}
