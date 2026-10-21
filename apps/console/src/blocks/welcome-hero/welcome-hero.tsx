/**
 * Stackra file contract:
 * Purpose: a registered L2 block: a heading, a line of text and one call to action, with props
 *          validated from the document.
 * Boundary: presentation only. Props arrive from a published document after the server validated
 *           them against `schemas/welcome-hero.schema.ts`; the block renders text through i18n keys
 *           the document references, never raw markup. The call to action names a route key,
 *           resolved through `#stackra/routes`, never a URL.
 * Runtime: browser
 * Governing contract: ADR 0110 (L2: registered coded components, Zod props, no code over the wire),
 *                     ADR 0128
 */
import { Button, Card } from "@stackra/ui";
import { useTranslation } from "@stackra/i18n/react";
import { useNavigate } from "@stackra/navigation/react";
import { Routes } from "#stackra/routes";
import type { WelcomeHeroProps } from "#src/schemas/welcome-hero.schema";

/**
 * The hero card; the button navigates through the router, so the target route's own gates still
 * apply.
 */
export function WelcomeHero({ titleKey, bodyKey, action }: WelcomeHeroProps) {
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
