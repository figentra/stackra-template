/**
 * Stackra file contract:
 * Purpose: proves the cycle shortcut moves to the next configured scheme and wraps from the last
 *          back to the first.
 * Boundary: unit tier; `runShortcut` builds the class with the console's theming config and runs it
 *           against the theming fake.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0080, ADR 0007
 */
import { runShortcut } from "@stackra/shortcuts/testing";
import { describe, expect, it } from "@stackra/testing";
import { ColorScheme } from "@stackra/theming";
import { CycleThemeShortcut } from "#src/shortcuts/cycle-theme.shortcut";

/** Guards the one place the scheme order is applied. */
describe(CycleThemeShortcut, () => {
  /** Light goes to dark, and system wraps around to light. */
  it("moves to the next scheme and wraps around", async () => {
    const fromLight = await runShortcut(CycleThemeShortcut, {
      theme: { scheme: ColorScheme.Light },
    });
    expect(fromLight.theme.scheme).toBe(ColorScheme.Dark);
    const fromSystem = await runShortcut(CycleThemeShortcut, {
      theme: { scheme: ColorScheme.System },
    });
    expect(fromSystem.theme.scheme).toBe(ColorScheme.Light);
  });
});
