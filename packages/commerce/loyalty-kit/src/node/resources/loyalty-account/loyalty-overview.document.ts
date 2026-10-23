/**
 * Stackra file contract:
 * Purpose: the customer-portal "My points" page: a dashboard holding the member's points-balance
 *          widget.
 * Boundary: a document is a saved, tenant-editable tree that only references registered code
 *           (ADR 0110, 0154): no markup, no expressions, no logic. A Dashboard places widget
 *           classes only, laid out on the grid by order and size, and publishes the slots
 *           `Slots.LoyaltyKit.LoyaltyOverview.Header` and `.Main`, so a host adds its own tiles
 *           without editing this file; a tenant may rearrange it, a member may hide tiles. Points
 *           are spent at checkout through the host's order flow, so the page holds no form. It is
 *           in the app area (a package never names an app's panel); the key
 *           (`loyalty_kit.loyalty_overview`) and the title
 *           (`loyalty_kit::documents.loyalty_overview.title`) are derived, and each tile keeps its
 *           query's permission.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 20), ADR 0110, ADR 0154, ADR 0164 and
 *                     ADR 0270 (dashboards, as amended by programming model v3.1, AGENTS.md)
 */
import { ApiArea } from "@stackra/contracts";
import { Blocks, Document, DocumentKind } from "@stackra/panel";
import { I18n } from "#stackra/i18n";
import { PointsBalanceWidget } from "#node/resources/loyalty-account/points-balance.widget";

/** Route `/loyalty` in the app area, listed under Loyalty. */
export class LoyaltyOverviewDocument extends Document({
  kind: DocumentKind.Dashboard,
  path: "/loyalty",
  area: ApiArea.App,
  navigation: {
    group: I18n.loyalty_kit.nav.loyalty,
    icon: "star",
    order: 10,
  },
  blocks: [Blocks.widget(PointsBalanceWidget)],
}) {}
