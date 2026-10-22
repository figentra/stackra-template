/**
 * Stackra file contract:
 * Purpose: the customer-portal "My points" screen: an L2 document composing the balance tile, the
 *          redeem form and a note. A document is data that only references registered code (ADR
 *          0110, 0154); a tenant may override it with a document of the same shape in the page
 *          builder.
 * Boundary: no markup, no expressions, no logic. The kind is `documents/`, so that "page" means a
 *           page-level component in an app. A declaration only: nothing runs here.
 * Runtime: node
 * Governing contract: ADR 0110, 0154, 0164, guides/programming-model.mdx#documents
 */
import { Bind, Blocks, Document, DocumentLayout } from "@stackra/panel";
import { Icons } from "@stackra/ui/icons";
import { Realm } from "@stackra/contracts";
import { I18n } from "#stackra/i18n";
import { GetBalanceQuery } from "#node/queries/get-balance.query";
import { RedeemPointsAction } from "#node/actions/redeem-points.action";
import { LoyaltyAccountPermissions } from "#node/permissions/loyalty-account.permission";
import { PointsBalanceTile } from "#core/override-points/points-balance.point";

/**
 * Route `/loyalty` in every panel that hosts the customer realm (a package never names an app's
 * panel); the tile binds the query with the caller's own loyalty
 * account.
 */
@Document({
  title: I18n.loyalty_kit.documents.overview,
  path: "/loyalty",
  realms: [Realm.Customer],
  permission: LoyaltyAccountPermissions.read,
  navigation: { group: I18n.loyalty_kit.nav.loyalty, icon: Icons.Star, order: 10 },
  layout: DocumentLayout.SingleColumn,
  blocks: [
    Blocks.component(PointsBalanceTile, {
      query: GetBalanceQuery,
      params: { accountId: Bind.actor.accountId },
    }),
    Blocks.actionForm(RedeemPointsAction, {
      title: I18n.loyalty_kit.documents.redeem_title,
      hidden: ["reference", "totalMinor"],
    }),
    Blocks.text(I18n.loyalty_kit.documents.expiry_note),
  ],
})
export class LoyaltyOverviewDocument {}
