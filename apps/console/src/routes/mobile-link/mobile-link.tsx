/**
 * Stackra file contract:
 * Purpose: the page of `MobileLinkRoute`, bound by name: shown only for a mobile link the console
 *          has no page for (announcements, the inbox, an unknown path). It says the link belongs
 *          to the Acme app, names the link, and offers the dashboard.
 * Boundary: presentation; the loader already redirected every link with a console counterpart, so
 *           `data.path` is the unmatched mobile path, rendered as text and never followed. A class
 *           component typed by its route (`RouteProps<typeof MobileLinkRoute>`), so it needs no
 *           props file; gen compiles it to a function component.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14; as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0080
 */
import { useTranslation } from "@stackra/i18n/react";
import type { RouteProps } from "@stackra/navigation";
import { Link } from "@stackra/navigation/react";
import { Button, Component } from "@stackra/ui";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";
import { EmptyView } from "#src/components/empty-view";
import type { MobileLinkRoute } from "#src/routes/mobile-link/mobile-link.route";

/** The notice and the way to the dashboard. */
export class MobileLink extends Component<RouteProps<typeof MobileLinkRoute>> {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** The page heading, the unmatched link and the empty view with the dashboard button. */
  render() {
    const { t } = this.i18n;
    return (
      <div className="flex flex-col gap-4">
        <h1 className="sr-only">{t(I18n.pages.mobile_link.title)}</h1>
        <EmptyView
          title={I18n.pages.mobile_link.heading}
          description={I18n.pages.mobile_link.body}
          icon="smartphone"
          action={
            <Button render={<Link to={Routes.dashboard} />}>
              {t(I18n.pages.mobile_link.dashboard)}
            </Button>
          }
        />
        <p className="text-center text-sm text-muted">
          {t(I18n.pages.mobile_link.link)} {/* a path reads left to right inside Arabic text too */}
          <bdi dir="ltr">{this.props.data.path}</bdi>
        </p>
      </div>
    );
  }
}
