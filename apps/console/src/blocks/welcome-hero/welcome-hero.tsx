/**
 * Stackra file contract:
 * Purpose: the renderer of `WelcomeHeroBlock`, bound by name: a heading, a line of text and one
 *          call to action.
 * Boundary: presentation only. Props arrive from a published document after the server validated
 *           them against the block class; text renders through the i18n keys the document
 *           references, never raw markup. The call to action names a route key, resolved through
 *           `#stackra/routes`, never a URL.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14), ADR 0110 (no code over the wire)
 */
import type { BlockProps } from "@stackra/experience";
import { useTranslation } from "@stackra/i18n/react";
import { useNavigate } from "@stackra/navigation/react";
import { Button, Card } from "@stackra/ui";
import { Routes } from "#stackra/routes";
import type { WelcomeHeroBlock } from "#src/blocks/welcome-hero/welcome-hero.block";

/**
 * The hero card; the button navigates through the router, so the target route's own gates still
 * apply.
 */
export function WelcomeHero({ titleKey, bodyKey, action }: BlockProps<typeof WelcomeHeroBlock>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Card>
      <Card.Header>
        <Card.Title>{t(titleKey)}</Card.Title>
        <Card.Description>{t(bodyKey)}</Card.Description>
      </Card.Header>
      {action && (
        <Card.Footer>
          <Button onPress={() => navigate(Routes[action.route])}>{t(action.labelKey)}</Button>
        </Card.Footer>
      )}
    </Card>
  );
}
