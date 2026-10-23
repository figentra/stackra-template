/**
 * Stackra file contract:
 * Purpose: proves the committed acme stylesheets are exactly the renderers' output for ACME_THEME,
 *          and that the theme's text pairs meet WCAG AA in both modes.
 * Boundary: unit tier; renders in memory and compares byte for byte with the files apps import.
 *           After a theme change, `pnpm --filter @acme/theme exec vitest run -u` rewrites both
 *           stylesheets; never edit them by hand.
 * Runtime: node
 * Governing contract: Stackra ADR 0302 (the committed CSS equals the generator's output), ADR 0022
 *                     (tests beside the subject)
 */
import { describe, expect, it } from "@stackra/testing";
import { contrastRatio, renderNativeCss, renderWebCss } from "@stackra/tokens";
import type { ColorRole } from "@stackra/tokens/contracts";
import { ACME_THEME } from "#core/constants/acme-theme.constant";

/** Text role on its background role; each pair must reach 4.5:1 (WCAG 2 AA, normal text). */
const TEXT_PAIRS: readonly (readonly [text: ColorRole, on: ColorRole])[] = [
  ["foreground", "background"],
  ["foreground", "surface"],
  ["muted", "background"],
  ["muted", "surface"],
  ["accent-foreground", "accent"],
  ["warning-foreground", "warning"],
  ["link", "background"],
];

/** Guards the two stylesheets every app imports and the readability of the acme brand. */
describe("ACME_THEME", () => {
  /** A hand edit to either file, or a theme change without regenerating, fails here. */
  it("matches the committed web and native stylesheets byte for byte", async () => {
    await expect(renderWebCss(ACME_THEME)).toMatchFileSnapshot(
      "../../../../assets/public/themes/acme/web.css",
    );
    await expect(renderNativeCss(ACME_THEME)).toMatchFileSnapshot(
      "../../../../assets/public/themes/acme/native.css",
    );
  });

  /** Contrast is computed from the derived hex, which is what the browser paints. */
  it("keeps every text pair at 4.5:1 or more in light and dark", () => {
    for (const [text, on] of TEXT_PAIRS) {
      const { colors } = ACME_THEME;
      expect(
        contrastRatio(colors[text].hexLight, colors[on].hexLight),
        `${text} light`,
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(colors[text].hexDark, colors[on].hexDark),
        `${text} dark`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});
