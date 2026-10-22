/**
 * Stackra file contract:
 * Purpose: `/store/:slug`: gallery, variant picker, price in the market currency, the description
 *          as an L2 document, breadcrumbs, and `Product`/`AggregateOffer`/`BreadcrumbList`
 *          structured data. Unknown or draft slug → 404; a renamed product's old slug → 301 to the
 *          current one.
 * Boundary: presentation of one product through the storefront projection of
 *           `catalogue.product.get_by_slug`; the loader turns the service's `product_not_found`
 *           refusal into the 404 page. Every link is built from a `Routes` ref, so it lands in the
 *           visitor's locale mount, and the structured trail matches the visible one: the store, a
 *           collection (the store filtered by it), this product. Prices in JSON-LD
 *           are decimal strings from `@stackra/money`. Canonical, hreflang and the site name are
 *           derived by the adapter.
 * Runtime: isomorphic
 * Governing contract: ADR 0110 (the description is a document), ADR 0135 (slugs, never ids), ADR
 *                     0220 (money)
 */
import { isRefusal } from "@stackra/errors";
import { Money } from "@stackra/money";
import { Route, type MetaContext, type RouteContext } from "@stackra/navigation";
import { OgKind, type Seo } from "@stackra/seo";
import { Commerce } from "#stackra/clients";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";
import { ProductPage } from "#src/components/pages/product";
import { CacheProfile } from "#src/enums/cache-profile.enum";
import { SiteLayout } from "#src/routes/site.layout";

/** Route `/store/:slug`: product gallery, variant picker and price in the market currency. */
@Route({
  path: "/store/:slug",
  layout: SiteLayout,
  cache: CacheProfile.Catalogue,
  component: ProductPage,
})
export class ProductRoute {
  /**
   * `product_not_found` from the service becomes a 404 the error boundary renders; anything else is
   * the error page. A slug the service resolved to a renamed product answers 301 to its current
   * slug, so only one URL per product is indexed.
   */
  async loader(ctx: RouteContext) {
    try {
      const product = await ctx.query(Commerce.queries.GetProductBySlug, {
        slug: ctx.params.slug,
      });
      ctx.redirectToCanonical(product.slug);
      return { product };
    } catch (error) {
      if (isRefusal(error, Commerce.refusals.product_not_found)) {
        throw ctx.notFound({ code: error.code });
      }
      throw error;
    }
  }

  /**
   * The tenant's `seo` fields win over the title and description when set; `noindex` is the
   * tenant's choice too.
   */
  meta({ data: { product }, site, href, t }: MetaContext<ProductRoute>): Seo {
    const absolute = (path: string) => `${site.origin}${path}`;
    const decimal = (minor: number) => Money.ofMinor(minor, product.currency).toDecimal();
    const prices = product.variants.map((variant) => variant.priceMinor);
    const page = absolute(href(Routes.product, { slug: product.slug }));
    const crumbs = [
      { name: t(I18n.web.product.breadcrumb_home), item: absolute(href(Routes.store)) },
      ...product.collections.map((collection) => ({
        name: collection.title,
        item: absolute(href(Routes.store, { search: { collection: collection.slug } })),
      })),
      { name: product.title, item: page },
    ];
    return {
      title: product.seo.title ?? product.title,
      description: product.seo.description ?? `${product.title} — ${site.name}`,
      noindex: product.seo.noindex,
      image: `${site.origin}/og/${OgKind.Product.value}/${product.slug}`,
      type: "product",
      jsonLd: [
        {
          "@type": "Product",
          name: product.title,
          image: product.images.map((image) => image.url),
          sku: product.variants[0]?.sku,
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: product.currency,
            lowPrice: decimal(Math.min(...prices)),
            highPrice: decimal(Math.max(...prices)),
            offerCount: product.variants.length,
            availability: product.inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            url: page,
          },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: crumbs.map((crumb, position) => ({
            "@type": "ListItem",
            position: position + 1,
            name: crumb.name,
            item: crumb.item,
          })),
        },
      ],
    };
  }
}
