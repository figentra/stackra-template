/**
 * Stackra file contract:
 * Purpose: the announcements page: renders the document the route adapter resolved (the tenant's
 *          published version, or the app's default class) with the native renderer kit.
 * Boundary: a class component bound to `AnnouncementsRoute` by its file name, its props typed
 *           `RouteProps<typeof AnnouncementsRoute>`. The renderer re-validates every node against
 *           the registered blocks and refuses an unknown key (ADR 0110 decision 6). A navigate verb
 *           carries a `RouteKey`, resolved here with `Routes[key]`; action verbs are dispatched by
 *           the renderer through the client.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 7 and 14, as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0110, ADR 0112
 */
import { DocumentRenderer } from "@stackra/experience/native";
import { type RouteProps, useNavigate, useRouteReload } from "@stackra/navigation/native";
import { Component } from "@stackra/ui/native";
import { Screen } from "#src/components/screen";
import type { AnnouncementsRoute } from "#src/routes/announcements/announcements.route";
import { type RouteKey, Routes } from "#stackra/routes";

/** The document page; `data.document` is what the route adapter resolved. */
export class Announcements extends Component<RouteProps<typeof AnnouncementsRoute>> {
  /** Typed navigation by route reference. */
  navigate = useNavigate();

  /** Re-runs the route's loader for pull-to-refresh. */
  reload = useRouteReload();

  /** Opens the route a navigate verb names. */
  open(key: RouteKey) {
    this.navigate.to(Routes[key]);
  }

  /** The renderer inside the refreshable screen. */
  render() {
    return (
      <Screen
        testID="document-page"
        onRefresh={this.reload.run}
        isRefreshing={this.reload.isRunning}
      >
        <DocumentRenderer
          document={this.props.data.document}
          onNavigate={(key: RouteKey) => this.open(key)}
        />
      </Screen>
    );
  }
}
