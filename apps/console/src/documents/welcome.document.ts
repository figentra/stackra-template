/**
 * Stackra file contract:
 * Purpose: the default welcome document a fresh tenant sees until it publishes its own in the page
 *          builder: the hero block, today's revenue and the low-stock widget. `WelcomeRoute` mounts
 *          it; the route adapter renders the tenant's published `console.welcome` instead when one
 *          exists.
 * Boundary: data that only references registered code (ADR 0110, 0154): blocks by class, widgets by
 *           descriptor, the call to action by route key; no markup, no expressions, no logic. The
 *           key (`console.welcome`), the title (`console::documents.welcome.title`) and the
 *           permission (the read permission of the widgets' queries) are derived; the route owns
 *           the path.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 14, 16 and 20), ADR 0110, ADR 0114, ADR 0154
 */
import { ApiArea } from "@stackra/contracts";
import { Blocks, Document, DocumentKind, DocumentLayout } from "@stackra/panel";
import { Commerce } from "#stackra/clients";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";
import { WelcomeHeroBlock } from "#src/blocks/welcome-hero/welcome-hero.block";

/** A page in the admin area: the hero, today's revenue and the low-stock widget, stacked. */
export class WelcomeDocument extends Document({
  kind: DocumentKind.Page,
  area: ApiArea.Admin,
  layout: DocumentLayout.Stack,
  blocks: [
    Blocks.custom(WelcomeHeroBlock, {
      titleKey: I18n.console.welcome.title,
      bodyKey: I18n.console.welcome.body,
      action: {
        labelKey: I18n.console.welcome.cta,
        route: Routes.quick_order.name,
      },
    }),
    Blocks.widget(Commerce.widgets.RevenueToday),
    Blocks.widget(Commerce.widgets.LowStock),
  ],
}) {}
