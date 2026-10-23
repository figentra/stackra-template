/**
 * Stackra file contract:
 * Purpose: the announcements screen: the tenant's published version of `AnnouncementsDocument`, or
 *          the app's default while the tenant has published nothing.
 * Boundary: a route class: options only. The route adapter resolves `document` through
 *           `Experience.queries.GetDocument` with the document's key and falls back to the class
 *           when the answer is `null`; the page only renders what it gets. The renderer
 *           re-validates every node against the registered blocks (ADR 0110 decision 6). Cached
 *           per published version, so a seen document also renders offline. The page is
 *           `announcements.tsx`, bound by name; the title is `mobile::routes.announcements.title`.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0110, ADR 0112
 */
import { Route } from "@stackra/navigation";
import { AnnouncementsDocument } from "#src/documents/announcements.document";

/** A pushed screen from Home. */
export class AnnouncementsRoute extends Route({
  path: "/announcements",
  document: AnnouncementsDocument,
  cache: { ttl: "1h" },
}) {}
