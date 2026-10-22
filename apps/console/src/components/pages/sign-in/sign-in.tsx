/**
 * Stackra file contract:
 * Purpose: a centred card with a spinner and a fallback link to the BFF login, shown while
 *          SignInRoute's redirect is in flight or was blocked.
 * Boundary: presentation over the loader's `loginUrl`; never a credential field. The title is the
 *           page's one `<h1>`; the fallback is a link styled as a button through `render`, the
 *           same link-as-button form every other page uses.
 * Runtime: browser
 * Governing contract: ADR 0241
 */
import type { RouteComponent } from "@stackra/navigation";
import { useTranslation } from "@stackra/i18n/react";
import { Button, Card, Spinner } from "@stackra/ui";
import { I18n } from "#stackra/i18n";
import type { SignInRoute } from "#src/routes/sign-in.route";

/** `data.loginUrl` is what the loader computed from IdentityConfig and the env's API origin. */
export const SignInPage: RouteComponent<typeof SignInRoute> = ({ data }) => {
  const { t } = useTranslation();
  return (
    <Card className="max-w-sm">
      <Card.Header>
        <Card.Title render={<h1 />}>{t(I18n.console.login.title)}</Card.Title>
        <Card.Description>{t(I18n.console.login.body)}</Card.Description>
      </Card.Header>
      <Card.Content className="flex items-center gap-3">
        <Spinner size="sm" aria-label={t(I18n.console.login.redirecting)} />
        <Button variant="secondary" render={<a href={data.loginUrl} />}>
          {t(I18n.console.login.continue)}
        </Button>
      </Card.Content>
    </Card>
  );
};
