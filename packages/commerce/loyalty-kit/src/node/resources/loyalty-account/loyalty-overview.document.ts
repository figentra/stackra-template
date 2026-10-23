/**
 * Stackra file contract:
 * Purpose: the customer-portal "My points" page: the balance widget, the redeem form and a note.
 * Boundary: a document is a saved, tenant-editable block tree that only references registered code
 *           (ADR 0110, 0154): no markup, no expressions, no logic. A tenant may replace it with a
 *           document of the same kind and path in the page builder. It is in the app area (a
 *           package never names an app's panel); the key (`loyalty_kit.loyalty_overview`) and the
 *           title (`loyalty_kit::documents.loyalty_overview.title`) are derived, and the
 *           permission is the read permission of the blocks' query. Blocks reference the kit's
 *           widget and action by class, so gen checks that they exist and fit.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 20), ADR 0110, ADR 0154, ADR 0164, ADR 0270
 */
import { ApiArea } from "@stackra/contracts";
import { Blocks, Document, DocumentKind, DocumentLayout } from "@stackra/panel";
import { Icons } from "@stackra/ui/icons";
import { I18n } from "#stackra/i18n";
import { RedeemPointsAction } from "#node/actions/redeem-points.action";
import { PointsBalanceWidget } from "#node/resources/loyalty-account/points-balance.widget";

/** Route `/loyalty` in the app area, listed under Loyalty. */
export class LoyaltyOverviewDocument extends Document({
  kind: DocumentKind.Page,
  path: "/loyalty",
  area: ApiArea.App,
  navigation: {
    group: I18n.loyalty_kit.nav.loyalty,
    icon: Icons.Star,
    order: 10,
  },
  layout: DocumentLayout.SingleColumn,
  blocks: [
    Blocks.widget(PointsBalanceWidget),
    Blocks.actionForm(RedeemPointsAction, {
      title: I18n.loyalty_kit.overview.redeem_title,
      hidden: ["reference", "totalMinor"],
    }),
    Blocks.text(I18n.loyalty_kit.overview.expiry_note),
  ],
}) {}
