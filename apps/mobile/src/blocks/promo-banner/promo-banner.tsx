/**
 * Stackra file contract:
 * Purpose: the promo banner block's component: a headline, body text and one call to action on a
 *          glass panel.
 * Boundary: a function component typed from the block's props schema plus the renderer's event
 *           sink; the block never navigates by itself. No markup, no HTML (ADR 0112 ADR 0148).
 * Runtime: react-native
 * Governing contract: ADR 0110, ADR 0112
 */
import type { BlockComponent } from "@stackra/experience/native";
import { Button } from "@stackra/ui/native";
import { Text } from "react-native";
import { Glass } from "#src/components/ui/glass";
import type { PromoBannerProps } from "#src/schemas/promo-banner.schema";

/**
 * The block, on a glass panel; `onEvent` dispatches to the renderer, which maps verbs to navigation
 * and keys to actions.
 */
export const PromoBanner: BlockComponent<PromoBannerProps> = ({ headline, body, cta, onEvent }) => (
  <Glass>
    <Text className="text-lg font-semibold text-ink">{headline}</Text>
    {body ? <Text className="mt-1 text-ink-muted">{body}</Text> : null}
    {cta ? (
      <Button className="mt-4 self-start" size="sm" onPress={() => onEvent(cta.event)}>
        {cta.label}
      </Button>
    ) : null}
  </Glass>
);
