/**
 * Stackra file contract:
 * Purpose: the default announcements document: what a fresh tenant sees on the phone until it
 *          publishes its own in the page builder. Data that only references registered code: a
 *          block by class with typed i18n keys the service substitutes per locale, a widget reused
 *          as a block, and a navigate verb holding a generated route key.
 * Boundary: no code, markup or CSS in a document (ADR 0110, ADR 0154). A document of kind Page:
 *           `AnnouncementsRoute` names it as its `document`, and the route adapter renders it when
 *           `GetDocumentQuery` answers `null` for its key. The key (`mobile.announcements`) and the
 *           title (`documents::announcements.title`, in the app's `documents` lang namespace) are
 *           derived; the area and the targets are the app's. Gen validates the tree against the
 *           registered blocks and widgets, so an unknown block fails the build, not the tenant.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 14, 16 and 20), ADR 0110, ADR 0112, ADR 0114, ADR 0154
 */
import { Blocks, Document, DocumentKind, DocumentLayout } from "@stackra/panel";
import { PromoBannerBlock } from "#src/blocks/promo-banner/promo-banner.block";
import { CtaVerb } from "#src/enums/cta-verb.enum";
import { OrderKpisWidget } from "#stackra/clients/commerce";
import { I18n } from "#stackra/i18n";
import { RouteKey } from "#stackra/routes";

/** The promo block with a call to action into the create-order sheet, then the sales KPIs. */
export class AnnouncementsDocument extends Document({
  kind: DocumentKind.Page,
  layout: DocumentLayout.Stack,
  blocks: [
    Blocks.custom(PromoBannerBlock, {
      headline: I18n.documents.announcements.headline,
      body: I18n.documents.announcements.body,
      cta: {
        label: I18n.documents.announcements.cta,
        event: {
          verb: CtaVerb.Navigate,
          route: RouteKey.CreateOrder,
        },
      },
    }),
    Blocks.widget(OrderKpisWidget),
  ],
}) {}
