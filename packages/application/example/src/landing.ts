/**
 * Stackra file contract:
 * Purpose: the landing entry of @figentra/acme-example (`./landing`): importing it registers the package's landing
 *          blocks, which the OS landing shell (os/landing@1) draws in the browser (ADR 0440 decision 4).
 * Boundary: registration only, on import.
 * Runtime: browser
 * Governing contract: ADR 0440 (decision 4); ADR 0441 (decision 3).
 */
import { registerBlocks } from "@stackra/experience";

import { HeroBlock } from "#src/blocks/hero/hero.block";
import { Hero } from "#src/blocks/hero/hero";

// shortcut: registered by hand until the generated wiring registers the package's blocks (STA-339).
registerBlocks([{ key: "acme_example.hero", block: HeroBlock, component: Hero }]);
