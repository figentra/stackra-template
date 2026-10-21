/**
 * Stackra file contract:
 * Purpose: the default announcements document: what a fresh tenant sees on the phone until it
 *          publishes its own in the page builder. Data that only references registered code: blocks
 *          by class, props as typed i18n keys the service substitutes per locale, a widget reused
 *          as a block, a navigate verb holding a `RouteKey`.
 * Boundary: no code, markup or CSS in a document (ADR 0110, 0154). `AnnouncementsRoute` names this
 *           class as its `document`; the route adapter renders it when
 *           `Experience.queries.GetDocument` answers `null` for its key. Gen validates the tree
 *           against the registered blocks and widgets at build time, so an unknown block fails the
 *           build, not the tenant. The key is declared short; the wire key is
 *           `mobile.announcements`.
 * Runtime: isomorphic
 * Governing contract: ADR 0110, ADR 0112, ADR 0114, ADR 0154
 */
import { Blocks, Document, DocumentLayout } from "@stackra/panel";
import { Target } from "@stackra/platform";
import { PromoBannerBlock } from "#src/blocks/promo-banner";
import { Commerce } from "#stackra/clients";
import { I18n } from "#stackra/i18n";
import { Panels } from "#stackra/panels";

/** The promo block with a call to action into the create-order sheet, then the revenue widget. */
@Document({
  key: "announcements",
  title: I18n.mobile.announcements.title,
  panels: [Panels.TenantAdmin],
  targets: [Target.Ios, Target.Android],
  layout: DocumentLayout.Stack,
  blocks: [
    Blocks.custom(PromoBannerBlock, {
      headline: I18n.mobile.announcements.headline,
      body: I18n.mobile.announcements.body,
      cta: {
        label: I18n.mobile.announcements.cta,
        event: { verb: "navigate", route: "create_order" },
      },
    }),
    Blocks.widget(Commerce.widgets.RevenueToday),
  ],
})
export class AnnouncementsDocument {}
