/**
 * Stackra file contract:
 * Purpose: the announcements page: renders the document the route adapter resolved (the tenant's
 *          published version, or the app's default class) with the native renderer kit.
 * Boundary: a function component bound to `AnnouncementsRoute` by its file name. The renderer
 *           re-validates every node against the registered blocks and refuses an unknown key
 *           (ADR 0110 decision 6). A navigate verb carries a `RouteKey`, resolved here with
 *           `Routes[key]`; action verbs are dispatched by the renderer through the client.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 7 and 14), ADR 0110, ADR 0112
 */
import { DocumentRenderer } from "@stackra/experience/native";
import { type RouteComponent, useNavigate, useRouteReload } from "@stackra/navigation/native";
import { Screen } from "#src/components/screen";
import type { AnnouncementsRoute } from "#src/routes/announcements/announcements.route";
import { type RouteKey, Routes } from "#stackra/routes";

/** The document page; `data.document` is what the route adapter resolved. */
export const Announcements: RouteComponent<typeof AnnouncementsRoute> = ({ data }) => {
  const navigate = useNavigate();
  const reload = useRouteReload();

  return (
    <Screen testID="document-page" onRefresh={reload.run} isRefreshing={reload.isRunning}>
      <DocumentRenderer
        document={data.document}
        onNavigate={(key: RouteKey) => navigate.to(Routes[key])}
      />
    </Screen>
  );
};
