/**
 * Stackra file contract:
 * Purpose: the 404 page inside the shell, bound to `NotFoundRoute` by name, with a link home.
 * Boundary: presentation; the status is the route's.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14), ADR 0140
 */
import { useTranslation } from "@stackra/i18n/react";
import type { RouteComponent } from "@stackra/navigation";
import { Link } from "@stackra/navigation/react";
import { Button } from "@stackra/ui";
import { Icons } from "@stackra/ui/icons";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";
import { EmptyView } from "#src/components/empty-view";
import type { NotFoundRoute } from "#src/routes/not-found/not-found.route";

/** Links to the dashboard by route key (`Routes.dashboard`), so a removed route is a type error. */
export const NotFound: RouteComponent<typeof NotFoundRoute> = () => {
  const { t } = useTranslation();
  return (
    <EmptyView
      title={I18n.console.errors.not_found.title}
      description={I18n.console.errors.not_found.body}
      icon={Icons.Compass}
      action={
        <Button render={<Link to={Routes.dashboard} />}>{t(I18n.console.errors.go_home)}</Button>
      }
    />
  );
};
