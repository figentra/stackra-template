/**
 * Stackra file contract:
 * Purpose: `catalogue.product.archive@1`: take a product off sale; an idempotent state transition.
 * Boundary: one aggregate, so it runs inline in one transaction. The permission is derived from the
 *           key (`ProductPermissions.archive`, L2) and ProductPolicy#archive refines it through
 *           `ctx.authorize(product)`; the endpoint is derived (`PUT /products/:productId/archive`).
 *           The transition records `product.archived`, which leaves through the outbox at flush.
 *           The cached view is forgotten after commit, so a concurrent read never caches the view
 *           from before the archive again.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 3, 16, 17 and 21), ADR 0098, ADR 0136, ADR 0137
 *                     (cache), ADR 0139
 */
import {
  Action,
  type ActionContext,
  ConflictResolution,
  IdMinting,
  OfflineMode,
  OfflinePrecondition,
  UxAfter,
} from "@stackra/actions";
import { type Cache, CacheKey } from "@stackra/cache";
import { ActorKind, type PublicId, Tone } from "@stackra/contracts";
import { Schema } from "@stackra/validation";
import { Product } from "#modules/catalogue/models/product.model";
import type { ProductStateMachine } from "#modules/catalogue/models/product.state-machine";
import type { ProductView } from "#modules/catalogue/schemas/product-view.schema";
import type { ProductService } from "#modules/catalogue/services/product.service";

/** The product to archive, by public id. */
export class ArchiveProductInput extends Schema {
  /** The product's public id. */
  productId!: PublicId<"prd">;
}

/**
 * Moves an active product to archived. Repeating the call on an archived product returns the same
 * view and records nothing, which is what makes PUT the right method. Offline clients may queue it
 * for 24 hours; the version check decides a conflict on replay. The console asks for confirmation
 * first.
 */
export class ArchiveProductAction extends Action({
  key: "product.archive",
  actors: [ActorKind.User, ActorKind.Agent],
  tool: true,
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
    confirm: Tone.Warning,
    after: [UxAfter.Refresh],
  },
}) {
  /**
   * @param lifecycle - the only writer of `Product.status`.
   * @param cache - holds ProductService's cached views; this product's are forgotten after commit.
   */
  constructor(
    private readonly products: ProductService,
    private readonly lifecycle: ProductStateMachine,
    private readonly cache: Cache,
  ) {
    super();
  }

  /**
   * Archives when the state allows it, then returns the view in the request locale.
   * @throws Refusal `not_found` for an unknown id in this tenant; `forbidden` when
   *         ProductPolicy#archive denies.
   */
  async handle(input: ArchiveProductInput, ctx: ActionContext): Promise<ProductView> {
    const product = await this.products.findOneOrFail(
      { id: input.productId },
      { populate: ["variants"] },
    );
    await ctx.authorize(product);
    if (this.lifecycle.can(product, "archive")) this.lifecycle.archive(product);
    ctx.afterCommit(() => this.cache.forget(CacheKey.of(Product, product.id)));
    return this.products.toView(product, ctx.locale);
  }
}
