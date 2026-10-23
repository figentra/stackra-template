/**
 * Stackra file contract:
 * Purpose: the product page, bound to `ProductRoute` by name: breadcrumb, image, title, price of
 *          the chosen variant, picker, the (disabled) cart button, the description document.
 * Boundary: presentation over ProductRoute's loader data; the variant choice is the shared hook's.
 *           "Add to cart" posts to the commerce headless cart when that wave lands; today it is a
 *           disabled button with the i18n label so the layout, the a11y and the e2e journey are
 *           already right. Links are route keys.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 7 and 14, as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0110 (the description is a document), ADR
 *                     0135 (slugs), ADR 0222 (image variants)
 */
import { DocumentRenderer } from "@stackra/experience/react";
import { useMoney, useTranslation } from "@stackra/i18n/react";
import { ImageFormat } from "@stackra/media";
import { useImageVariant } from "@stackra/media/react";
import type { RouteProps } from "@stackra/navigation";
import { Link } from "@stackra/navigation/react";
import { Button, Component } from "@stackra/ui";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";
import { VariantPicker } from "#src/components/variant-picker";
import { useVariantChoice } from "#src/hooks/use-variant-choice";
import type { ProductRoute } from "#src/routes/product/product.route";

/** The hero image width; the box is square. */
const HERO_IMAGE_WIDTH = 960;

/** Breadcrumb, image, title, variant price and picker, and the disabled cart button. */
export class Product extends Component<RouteProps<typeof ProductRoute>> {
  /** The translator of the visitor's locale. */
  translation = useTranslation();

  /** Formats a minor-unit amount in the visitor's locale. */
  money = useMoney();

  /** The chosen variant, the option axes and the way to pick a value. */
  choice = useVariantChoice(this.props.data.product.variants);

  /** The first image's resized variant, the page's LCP element. */
  image = useImageVariant(this.props.data.product.images[0], {
    width: HERO_IMAGE_WIDTH,
    format: ImageFormat.Webp,
  });

  /** The breadcrumb across the top, the image beside the buying column. */
  render() {
    const { t } = this.translation;
    const { product } = this.props.data;
    const { variant } = this.choice;
    return (
      <article className="grid gap-10 md:grid-cols-2">
        <nav aria-label={t(I18n.web.product.breadcrumb)} className="md:col-span-2">
          <ol className="flex flex-wrap gap-2 text-sm text-ink-muted">
            <li>
              <Link to={Routes.store}>{t(I18n.web.product.breadcrumb_home)}</Link>
            </li>
            {product.collections.map((collection) => (
              <li key={collection.slug} className="before:me-2 before:content-['/']">
                <Link to={Routes.store} search={{ collection: collection.slug }}>
                  {collection.title}
                </Link>
              </li>
            ))}
            <li aria-current="page" className="before:me-2 before:content-['/']">
              {product.title}
            </li>
          </ol>
        </nav>
        <figure>
          <img
            src={this.image?.url}
            alt={product.images[0]?.alt ?? ""}
            width={HERO_IMAGE_WIDTH}
            height={HERO_IMAGE_WIDTH}
            fetchPriority="high"
            className="rounded-panel"
          />
        </figure>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{product.title}</h1>
          <p className="mt-2 text-2xl" data-testid="price">
            {this.money(variant.priceMinor, product.currency)}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {variant.inStock ? t(I18n.web.store.in_stock) : t(I18n.web.store.out_of_stock)}
          </p>
          <VariantPicker choice={this.choice} />
          {/* shortcut: no cart until the checkout wave; the real button keeps a11y and e2e honest */}
          <Button className="mt-6" isDisabled={!variant.inStock} fullWidth>
            {t(I18n.web.product.add_to_cart)}
          </Button>
          <section className="prose mt-8">
            <DocumentRenderer document={product.description} />
          </section>
        </div>
      </article>
    );
  }
}
