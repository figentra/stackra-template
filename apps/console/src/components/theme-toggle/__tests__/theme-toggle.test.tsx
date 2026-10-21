/**
 * Stackra file contract:
 * Purpose: each press moves to the next scheme in the cycle and the label says where it is.
 * Boundary: unit tier, jsdom; the theming provider is the render option's, seeded with the light
 *           scheme.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0080
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen, userEvent } from "@stackra/testing/react";
import { ColorScheme } from "@stackra/theming";
import { ThemeToggle } from "#src/components/theme-toggle";

/** Guards the theme control that users reach from every console screen. */
describe(ThemeToggle, () => {
  /** The three-way cycle must reach every mode and announce the current one. */
  it("cycles light, dark, system", async () => {
    render(<ThemeToggle />, { locale: "en", theme: { scheme: ColorScheme.Light } });
    await userEvent.click(screen.getByRole("button", { name: "Theme: Light" }));
    expect(screen.getByRole("button", { name: "Theme: Dark" })).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Theme: Dark" }));
    expect(screen.getByRole("button", { name: "Theme: System" })).toBeTruthy();
  });
});
