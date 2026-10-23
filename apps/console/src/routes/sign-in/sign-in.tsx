/**
 * Stackra file contract:
 * Purpose: the sign-in page, bound to `SignInRoute` by name: a centred card with a spinner and a
 *          fallback link to the BFF login, shown while the route's redirect is in flight or was
 *          blocked.
 * Boundary: presentation over the loader's `loginUrl`; never a credential field. The title is the
 *           page's one `<h1>`; the fallback is a link styled as a button through `render`, the same
 *           link-as-button form every other page uses. A class component typed by its route
 *           (`RouteProps<typeof SignInRoute>`), so it needs no props file; gen compiles it to a
 *           function component.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14; as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0241
 */
import { useTranslation } from "@stackra/i18n/react";
import type { RouteProps } from "@stackra/navigation";
import { Button, Card, Component, Spinner } from "@stackra/ui";
import { I18n } from "#stackra/i18n";
import type { SignInRoute } from "#src/routes/sign-in/sign-in.route";

/** `data.loginUrl` is what the loader computed from IdentityConfig and the env's API origin. */
export class SignIn extends Component<RouteProps<typeof SignInRoute>> {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** The card with the spinner and the fallback link. */
  render() {
    const { t } = this.i18n;
    return (
      <Card className="max-w-sm">
        <Card.Header>
          <Card.Title render={<h1 />}>{t(I18n.pages.login.title)}</Card.Title>
          <Card.Description>{t(I18n.pages.login.body)}</Card.Description>
        </Card.Header>
        <Card.Content className="flex items-center gap-3">
          <Spinner size="sm" aria-label={t(I18n.pages.login.redirecting)} />
          <Button variant="secondary" render={<a href={this.props.data.loginUrl} />}>
            {t(I18n.pages.login.continue)}
          </Button>
        </Card.Content>
      </Card>
    );
  }
}
