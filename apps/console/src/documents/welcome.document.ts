/**
 * Stackra file contract:
 * Purpose: the default L2 welcome document a fresh tenant sees until it publishes its own in the
 *          page builder: the hero block, today's revenue and the low-stock widget. `WelcomeRoute`
 *          mounts it; the route adapter renders the tenant's published `console.welcome` instead
 *          when one exists.
 * Boundary: data that only references registered code (ADR 0110, 0154): blocks by class, widgets by
 *           descriptor, the call to action by route key; no markup, no expressions, no logic. The
 *           key is declared short and gen prefixes the member key on the wire.
 * Runtime: isomorphic
 * Governing contract: ADR 0110, ADR 0114, ADR 0154
 */
import { Blocks, Document, DocumentLayout } from "@stackra/panel";
import { Commerce } from "#stackra/clients";
import { I18n } from "#stackra/i18n";
import { Panels } from "#stackra/panels";
import { WelcomeHeroBlock } from "#src/blocks/welcome-hero";

/** Document `console.welcome`: the hero, today's revenue and the low-stock widget. */
@Document({
  key: "welcome",
  title: I18n.console.pages.welcome,
  panels: [Panels.TenantAdmin],
  permission: Commerce.permissions.Order.read,
  layout: DocumentLayout.Stack,
  blocks: [
    Blocks.custom(WelcomeHeroBlock, {
      titleKey: I18n.console.welcome.title,
      bodyKey: I18n.console.welcome.body,
      action: { labelKey: I18n.console.welcome.cta, route: "quick_order" },
    }),
    Blocks.widget(Commerce.widgets.RevenueToday),
    Blocks.widget(Commerce.widgets.LowStock),
  ],
})
export class WelcomeDocument {}
