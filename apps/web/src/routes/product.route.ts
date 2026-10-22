/**
 * Stackra file contract:
 * Purpose: `/store/:slug`: gallery, variant picker, price in the market currency, the description
 *          as an L2 document, breadcrumbs, and `Product`/`AggregateOffer`/`BreadcrumbList`
 *          structured data. Unknown or draft slug → 404.
 * Boundary: presentation of one product through the storefront projection of
 *           `catalogue.product.get_by_slug`; the loader turns the service's `product_not_found`
 *           refusal into the 404 page. Prices in JSON-LD are decimal strings from `@stackra/money`.
 * Runtime: isomorphic
 * Governing contract: ADR 0110 (the description is a document), ADR 0135 (slugs, never ids), ADR
 *                     0220 (money)
 */
import { isRefusal } from "@stackra/errors";
import { Money } from "@stackra/money";
import { Route, type MetaContext, type RouteContext } from "@stackra/navigation";
import { jsonLd, OgKind, seoMeta } from "@stackra/seo";
import { Commerce } from "#stackra/clients";
import { ProductPage } from "#src/components/pages/product";
import { I18nConfig } from "#src/config/i18n.config";
import { CacheProfile } from "#src/enums/cache-profile.enum";
import { alternates } from "#src/server/alternates.server";
import { localePath } from "#src/server/locale-path.server";
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
   * the error page.
   */
  async loader(ctx: RouteContext) {
    try {
      return {
        product: await ctx.query(Commerce.queries.GetProductBySlug, { slug: ctx.params.slug }),
      };
    } catch (error) {
      if (isRefusal(error, Commerce.refusals.product_not_found))
        throw ctx.notFound({ code: error.code });
      throw error;
    }
  }

  /**
   * The tenant's `seo` fields win over the title and description when set; `noindex` is the
   * tenant's choice too.
   */
  meta(ctx: MetaContext<ProductRoute>) {
    const {
      data: { product },
      site,
      path,
    } = ctx;
    const url = alternates(ctx, path);
    const i18n = ctx.config(I18nConfig);
    const decimal = (minor: number) => Money.ofMinor(minor, product.currency).toDecimal();
    const prices = product.variants.map((v) => v.priceMinor);
    const storeUrl = (slug?: string) =>
      `${site.origin}${localePath(i18n, site.locale, slug ? `/store/${slug}` : "/store")}`;
    const crumbs = [{ title: site.name, slug: "" }, ...product.collections, product];
    return [
      ...seoMeta({
        title: product.seo.title ?? product.title,
        description: product.seo.description ?? `${product.title} — ${site.name}`,
        siteName: site.name,
        locale: site.locale,
        canonical: url[site.locale.value]!,
        alternates: url,
        noindex: !site.indexable || product.seo.noindex,
        image: `${site.origin}/og/${OgKind.Product.value}/${product.slug}`,
        type: "product",
      }),
      jsonLd({
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
          url: url[site.locale.value],
        },
      }),
      jsonLd({
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((crumb, position) => ({
          "@type": "ListItem",
          position: position + 1,
          name: crumb.title,
          item: storeUrl(crumb.slug || undefined),
        })),
      }),
    ];
  }
}
