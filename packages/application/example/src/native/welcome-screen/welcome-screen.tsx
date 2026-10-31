/**
 * Stackra file contract:
 * Purpose: `WelcomeScreen`, the example package's mobile screen: a heading and a line saying where it comes from.
 * Boundary: draws only; no data.
 * Runtime: react-native
 * Governing contract: ADR 0436 (decision 2); ADR 0439.
 */
import type { ReactElement } from "react";
import { ScrollView, Text } from "react-native";

import { EXAMPLE_COPY } from "#src/core/constants/example-copy.constant";

// shortcut: a function component with inline styles until the screen is a package screen class (STA-339).
/** The example mobile screen. */
export function WelcomeScreen(): ReactElement {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 20, gap: 12 }}
    >
      <Text style={{ fontSize: 28, fontWeight: "700" }}>{EXAMPLE_COPY.title}</Text>
      <Text style={{ fontSize: 17 }}>{EXAMPLE_COPY.mobile}</Text>
    </ScrollView>
  );
}
