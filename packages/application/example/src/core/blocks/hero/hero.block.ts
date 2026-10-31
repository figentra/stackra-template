/**
 * Stackra file contract:
 * Purpose: `HeroBlock`, the example's landing block: a title and a line under it, which a landing document names as
 *          `example.hero`.
 * Boundary: the props only; the web component is `react/hero/hero.tsx`.
 * Runtime: isomorphic
 * Governing contract: ADR 0440 (decision 4: a product block renders in the browser); ADR 0270.
 */
import { Block, BlockCategory } from "@stackra/experience";
import { registerSchemas } from "@stackra/validation";
import { z } from "zod";

import { HERO_BLOCK } from "#src/core/constants/hero-block.constant";

/** The example hero. */
export class HeroBlock extends Block({
  category: BlockCategory.Marketing,
  icon: HERO_BLOCK.icon,
}) {
  /** The headline the hero shows. */
  title!: string;

  /** The line under it. */
  subtitle?: string;
}

// shortcut: the props schema by hand until gen compiles the block's fields to it (STA-339).
registerSchemas([
  [HeroBlock, z.object({ title: z.string().min(1), subtitle: z.string().optional() })],
]);
