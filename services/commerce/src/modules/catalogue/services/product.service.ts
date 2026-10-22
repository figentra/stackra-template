/**
 * Stackra file contract:
 * Purpose: product domain logic. @Crud gives the inherited reads and generates create, update and
 *          list; this class adds what other modules need.
 * Boundary: exported to sibling modules (catalogue.module.ts). No transport, no permission checks
 *           (the pipeline does). The generated create is gated by the ProductLimit entitlement.
 * Runtime: node
 * Governing contract: ADR 0105 (@Crud), ADR 0137 (cache), guides/programming-model.mdx#services;
 *                     ADR 0127
 */
import { Cacheable } from "@stackra/cache";
import type { Repository } from "@stackra/database";
import { Crud, CrudService } from "@stackra/database";
import type { Locale } from "@stackra/i18n";
import { Product } from "#modules/catalogue/models/product.model";
import type { Variant } from "#modules/catalogue/models/variant.model";
import type { ProductView } from "#modules/catalogue/schemas/product-view.schema";
import { ProductStatus } from "#modules/catalogue/enums/product-status.enum";
import { ProductLimit } from "#modules/catalogue/entitlements/product-limit.entitlement";
import { ProductNotFoundError } from "#modules/catalogue/errors/product-not-found.error";
import { VariantUnavailableError } from "#modules/catalogue/errors/variant-unavailable.error";

/**
 * The product aggregate's service. `@Crud` generates `catalogue.product.create`, `.update` and
 * `.list` as real actions and queries into `#stackra/crud` (`ProductCrud.Create`, …), bound to the
 * same-named permission members; `requires` puts the entitlement gate on create.
 */
@Crud(Product, { actions: ["create", "update", "list"], requires: { create: [ProductLimit] } })
export class ProductService extends CrudService<Product> {
  /**
   * @param products - resolved by gen from the `Repository<Product>` type; the CrudService base.
   * @param variants - read only here; variants are written through the generated actions.
   */
  constructor(
    protected readonly products: Repository<Product>,
    private readonly variants: Repository<Variant>,
  ) {
    super(products);
  }

  /**
   * Product by public id, cached per tenant and locale for ten minutes; the tag is derived from the
   * model key and the first argument, so `archive` evicts exactly this entry.
   * @throws ProductNotFoundError when no product has this id in the current tenant.
   */
  @Cacheable({ ttl: "10m", tags: [Product] })
  async view(id: string, locale: Locale): Promise<ProductView> {
    const p = await this.products.findOne({ id }, { populate: ["variants"] });
    if (!p) throw new ProductNotFoundError({ id });
    return this.toView(p, locale);
  }

  /** The one mapping from row to ProductView (variants must be populated). */
  toView(p: Product, locale: Locale): ProductView {
    return {
      id: p.id,
      title: p.title.in(locale),
      slug: p.slug,
      status: p.status.value,
      variants: p.variants.map(({ id, sku }) => ({ id, sku })),
    };
  }

  /**
   * Ensures every variant exists and belongs to a sellable product. Orders calls it before pricing
   * so a stale cart fails here with a clear code rather than deep in the workflow.
   * @throws VariantUnavailableError listing every id that is missing or not sellable.
   */
  async assertSellable(variantIds: readonly string[]): Promise<void> {
    const rows = await this.variants.find({
      id: { $in: [...variantIds] },
      product: { status: ProductStatus.Active },
    });
    const found = new Set(rows.map((v) => v.id));
    const missing = variantIds.filter((id) => !found.has(id));
    if (missing.length > 0) throw new VariantUnavailableError(missing);
  }
}
