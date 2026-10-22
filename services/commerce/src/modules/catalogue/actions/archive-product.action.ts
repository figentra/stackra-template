/**
 * Stackra file contract:
 * Purpose: `catalogue.product.archive`: take a product off sale; an idempotent state transition
 *          (PUT).
 * Boundary: one transaction; the public event is recorded by the transition and leaves through the
 *           outbox at flush; the cache entry is evicted after commit so a concurrent read never
 *           re-caches the pre-archive view.
 * Runtime: node
 * Governing contract: ADR 0098, 0136, 0139, http conventions (PUT for idempotent transitions), v2
 *                     guides/programming-model.mdx#actions
 */
import {
  Action,
  type ActionContext,
  AsEndpoint,
  AsTool,
  ConflictResolution,
  IdMinting,
  OfflineMode,
  OfflinePrecondition,
  UxAfter,
} from "@stackra/actions";
import { CacheEvict } from "@stackra/cache";
import { I18n } from "#stackra/i18n";
import { ProductService } from "#modules/catalogue/services/product.service";
import { ProductPermissions } from "#modules/catalogue/permissions/product.permission";
import { ArchiveProductInput } from "#modules/catalogue/schemas/archive-product-input.schema";
import { ProductView } from "#modules/catalogue/schemas/product-view.schema";
import { Archive } from "#modules/catalogue/states/product.state";
import { Product } from "#modules/catalogue/models/product.model";
import { ActorKind, HttpMethod, Tone } from "@stackra/contracts";

/**
 * Moves a product to Archived. Repeating the call on an archived product returns the same view and
 * records nothing, which is what makes PUT the right method.
 */
@Action({
  key: "product.archive",
  input: ArchiveProductInput,
  output: ProductView,
  permission: ProductPermissions.archive,
  actors: [ActorKind.User, ActorKind.Agent],
  intents: ["archive the summer dress", "stop selling this product"],
  offline: {
    mode: OfflineMode.Queue,
    idMinting: IdMinting.Server,
    precondition: OfflinePrecondition.Version,
    retention: "24h",
    onConflict: [
      ConflictResolution.ServerWins,
      ConflictResolution.ClientRetry,
      ConflictResolution.Manual,
    ],
  },
  ux: {
    requiresConfirmation: { text: I18n.catalogue.product.archive_confirm, color: Tone.Warning },
    success: I18n.catalogue.product.archived,
    after: [UxAfter.Refresh],
  },
})
@AsEndpoint({ method: HttpMethod.Put, path: "/products/:productId/archive" })
@AsTool()
export class ArchiveProductAction {
  constructor(private readonly products: ProductService) {}

  /**
   * The evict runs after commit, keyed like the cached `view` (model tag + the id in the input).
   * @throws AppError `not_found` when the id is unknown in this tenant; `forbidden` when
   *   ProductPolicy.archive denies.
   */
  @CacheEvict({ tags: [Product], key: (input: ArchiveProductInput) => input.productId })
  async handle(input: ArchiveProductInput, ctx: ActionContext): Promise<ProductView> {
    const product = await this.products.findOneOrFail(
      { id: input.productId },
      { populate: ["variants"] },
    );
    await ctx.authorize(ProductPermissions.archive, product);
    if (product.status.canTransitionTo(Archive)) await product.status.transition(new Archive());
    return this.products.toView(product, ctx.locale);
  }
}
