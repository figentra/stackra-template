/**
 * Stackra file contract:
 * Purpose: `ExampleHome`, the example package's console page: a heading and a card saying where it comes from.
 * Boundary: draws only; no data.
 * Runtime: browser
 * Governing contract: ADR 0436 (decision 2: a product ships packages); ADR 0469 (free components only).
 */
import { Card, Heading } from "@stackra/ui/react";
import type { ReactElement } from "react";

import { EXAMPLE_COPY } from "#src/constants/example-copy.constant";

// shortcut: a function component until the console page is a panel resource of the package's module (STA-339).
/** The example console page. */
export function ExampleHome(): ReactElement {
  return (
    <Card>
      <Card.Header>
        <Heading level={2}>{EXAMPLE_COPY.title}</Heading>
      </Card.Header>
      <Card.Content>{EXAMPLE_COPY.console}</Card.Content>
    </Card>
  );
}
