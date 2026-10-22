/**
 * Stackra file contract:
 * Purpose: proves the cycle command moves to the next configured scheme and wraps from the last
 *          back to the first.
 * Boundary: unit tier; `runCommand` runs the class against the theming fake.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0080, ADR 0007
 */
import { runCommand } from "@stackra/kbd/testing";
import { describe, expect, it } from "@stackra/testing";
import { ColorScheme } from "@stackra/theming";
import { CycleThemeCommand } from "#src/commands/cycle-theme.command";

/** Guards the one place the scheme order is applied. */
describe(CycleThemeCommand, () => {
  /** Light goes to dark, and system wraps around to light. */
  it("moves to the next scheme and wraps around", async () => {
    expect(
      (await runCommand(CycleThemeCommand, { theme: { scheme: ColorScheme.Light } })).theme.scheme,
    ).toBe(ColorScheme.Dark);
    expect(
      (await runCommand(CycleThemeCommand, { theme: { scheme: ColorScheme.System } })).theme.scheme,
    ).toBe(ColorScheme.Light);
  });
});
