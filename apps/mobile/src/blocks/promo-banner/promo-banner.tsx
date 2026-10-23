/**
 * Stackra file contract:
 * Purpose: the promo banner block's renderer: a headline, body text and one call to action on a
 *          glass panel.
 * Boundary: a function component bound to `PromoBannerBlock` by its file name; the props are the
 *           block's fields plus the renderer's event sink, so the block never navigates by itself.
 *           No markup, no HTML (ADR 0112, ADR 0148).
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 7 and 14), ADR 0110, ADR 0112
 */
import type { BlockProps } from "@stackra/experience/native";
import { Button } from "@stackra/ui/native";
import { Text } from "react-native";
import type { PromoBannerBlock } from "#src/blocks/promo-banner/promo-banner.block";
import { Glass } from "#src/components/glass";

/**
 * The block on a glass panel; `onEvent` hands the verb to the renderer, which maps navigate to the
 * router and action to a client call.
 */
export function PromoBanner({ headline, body, cta, onEvent }: BlockProps<typeof PromoBannerBlock>) {
  return (
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
}
