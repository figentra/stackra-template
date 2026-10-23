/**
 * Stackra file contract:
 * Purpose: the renderer of `WelcomeHeroBlock`, bound by name: a heading, a line of text and one
 *          call to action.
 * Boundary: presentation only. Props arrive from a published document after the server validated
 *           them against the block class; text renders through the i18n keys the document
 *           references, never raw markup. The call to action names a route key, resolved through
 *           `#stackra/routes`, never a URL. A class component typed by the block's derived props
 *           (`BlockProps<typeof WelcomeHeroBlock>`), so it needs no props file; gen compiles it to
 *           a function component.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14; as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0110 (no code over the wire)
 */
import type { BlockProps } from "@stackra/experience";
import { useTranslation } from "@stackra/i18n/react";
import { useNavigate } from "@stackra/navigation/react";
import { Button, Card, Component } from "@stackra/ui";
import { Routes } from "#stackra/routes";
import type { WelcomeHeroBlock } from "#src/blocks/welcome-hero/welcome-hero.block";

/**
 * The hero card; the button navigates through the router, so the target route's own gates still
 * apply.
 */
export class WelcomeHero extends Component<BlockProps<typeof WelcomeHeroBlock>> {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** The router's navigate. */
  navigate = useNavigate();

  /** Opens the call to action's route. */
  open() {
    if (this.props.action) this.navigate(Routes[this.props.action.route]);
  }

  /** The card; no call to action renders no footer. */
  render() {
    const { titleKey, bodyKey, action } = this.props;
    return (
      <Card>
        <Card.Header>
          <Card.Title>{this.i18n.t(titleKey)}</Card.Title>
          <Card.Description>{this.i18n.t(bodyKey)}</Card.Description>
        </Card.Header>
        {action && (
          <Card.Footer>
            <Button onPress={() => this.open()}>{this.i18n.t(action.labelKey)}</Button>
          </Card.Footer>
        )}
      </Card>
    );
  }
}
