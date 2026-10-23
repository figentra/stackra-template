/**
 * Stackra file contract:
 * Purpose: the 404 page inside the shell, bound to `NotFoundRoute` by name, with a link home.
 * Boundary: presentation; the status is the route's. A class component typed by its route
 *           (`RouteProps<typeof NotFoundRoute>`), so it needs no props file; gen compiles it to a
 *           function component.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14; as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0140
 */
import { useTranslation } from "@stackra/i18n/react";
import type { RouteProps } from "@stackra/navigation";
import { Link } from "@stackra/navigation/react";
import { Button, Component } from "@stackra/ui";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";
import { EmptyView } from "#src/components/empty-view";
import type { NotFoundRoute } from "#src/routes/not-found/not-found.route";

/** Links to the dashboard by route key (`Routes.dashboard`), so a removed route is a type error. */
export class NotFound extends Component<RouteProps<typeof NotFoundRoute>> {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** The empty view with the way home. */
  render() {
    return (
      <EmptyView
        title={I18n.console.errors.not_found.title}
        description={I18n.console.errors.not_found.body}
        icon="compass"
        action={
          <Button render={<Link to={Routes.dashboard} />}>
            {this.i18n.t(I18n.console.errors.go_home)}
          </Button>
        }
      />
    );
  }
}
