/**
 * Stackra file contract:
 * Purpose: `Hero`, the web component of `HeroBlock`: the headline and the line under it.
 * Boundary: draws only.
 * Runtime: browser
 * Governing contract: ADR 0440 (decision 4); ADR 0469 (free components only).
 */
import { Heading } from "@stackra/ui/react";
import type { ReactElement } from "react";

import type { HeroProps } from "#src/react/hero/hero.props";

// shortcut: a function component until block components are bound by name by gen (STA-339).
/** The example hero. */
export function Hero({ title, subtitle }: HeroProps): ReactElement {
  return (
    <section style={{ padding: "64px 24px", textAlign: "center" }}>
      <Heading level={1}>{title}</Heading>
      {subtitle === undefined ? null : <p>{subtitle}</p>}
    </section>
  );
}
