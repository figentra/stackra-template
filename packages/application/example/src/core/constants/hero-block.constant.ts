/**
 * Stackra file contract:
 * Purpose: `HERO_BLOCK`, the palette data of the example's landing block: its icon.
 * Boundary: data only; `HeroBlock` reads it.
 * Runtime: isomorphic
 * Governing contract: ADR 0322 (decision 3: the constants group); ADR 0270.
 */
import type { IconName } from "@stackra/icons/contracts";

// shortcut: a literal icon name until gen emits the package's `Icons` constants (STA-339).
/** The example hero's palette data. */
export const HERO_BLOCK = {
  /** The icon the block palette shows beside the hero entry. */
  icon: "sparkles",
} as const satisfies { readonly icon: IconName };
