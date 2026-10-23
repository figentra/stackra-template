/**
 * Stackra file contract:
 * Purpose: proves the store toggles, derives the density class from the enum's meta, and persists
 *          through the prefs store.
 * Boundary: unit tier; `@stackra/state/testing` mounts the store against a memory prefs store.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0079, ADR 0007
 */
import { mountStore } from "@stackra/state/testing";
import { describe, expect, it } from "@stackra/testing";
import { Density } from "#src/enums/density.enum";
import { UiStore } from "#src/stores/ui.store";

/** Guards console UI preferences that persist across sessions. */
describe(UiStore, () => {
  /** The class name is the enum's meta, so a new density cannot forget its CSS hook. */
  it("derives the density class and persists the density as its code", () => {
    const { store, prefs } = mountStore(UiStore);
    store.setDensity(Density.Compact);
    expect(store.densityClass).toBe("panel-compact");
    expect(prefs.get("console.ui")).toMatchObject({ density: "compact" });
  });

  /** The sidebar toggle must flip state so the layout responds to the user. */
  it("toggles the sidebar", () => {
    const { store } = mountStore(UiStore);
    store.toggleSidebar();
    expect(store.sidebarCollapsed).toBe(true);
  });
});
