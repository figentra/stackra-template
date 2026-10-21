/**
 * Stackra file contract:
 * Purpose: the announcements screen: the tenant's published version of `AnnouncementsDocument`, or
 *          the app's default while the tenant has published nothing.
 * Boundary: options only. The route adapter resolves `document` through
 *           `Experience.queries.GetDocument` with the document's key and falls back to the class
 *           when the answer is `null`; the page only renders what it gets. The renderer
 *           re-validates every node against the registered blocks (ADR 0110 d6).
 * Runtime: react-native
 * Governing contract: ADR 0110, ADR 0112
 */
import { Presentation, Route } from "@stackra/navigation";
import { DocumentPage } from "#src/components/pages/document";
import { AnnouncementsDocument } from "#src/documents/announcements.document";
import { I18n } from "#stackra/i18n";

/** A pushed card; cached per published version so a seen document also renders offline. */
@Route({
  path: "/announcements",
  auth: true,
  document: AnnouncementsDocument,
  presentation: Presentation.Card,
  header: { title: I18n.mobile.announcements.title },
  cache: { ttl: "1h" },
  component: DocumentPage,
})
export class AnnouncementsRoute {}
