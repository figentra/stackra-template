/**
 * Stackra file contract:
 * Purpose: the product page: breadcrumb, image, title, price of the chosen variant, picker, the
 *          (disabled) cart button, the description document.
 * Boundary: presentation over ProductRoute's loader data; the variant choice is the shared hook's.
 *           "Add to cart" posts to the commerce headless cart when that wave lands; today it is a
 *           disabled button with the i18n label so the layout, the a11y and the e2e journey are
 *           already right. Links are route classes.
 * Runtime: isomorphic
 * Governing contract: ADR 0110 (the description is a document), ADR 0135 (slugs), ADR 0222 (image
 *                     variants)
 */
import { DocumentRenderer } from "@stackra/experience/react";
import { useMoney, useTranslation } from "@stackra/i18n/react";
import { ImageFormat } from "@stackra/media";
import { useImageVariant } from "@stackra/media/react";
import type { RouteComponent } from "@stackra/navigation";
import { Link } from "@stackra/navigation/react";
import { Button } from "@stackra/ui";
import { I18n } from "#stackra/i18n";
import { VariantPicker } from "#src/components/variant-picker";
import { useVariantChoice } from "#src/hooks/use-variant-choice";
import type { ProductRoute } from "#src/routes/product.route";
import { Routes } from "#stackra/routes";

/** The hero image width; the box is square. */
const HERO_IMAGE_WIDTH = 960;

/**
 * Product page component: breadcrumb, image, title, variant price and picker, and the disabled cart
 * button.
 */
export const ProductPage: RouteComponent<typeof ProductRoute> = ({ data: { product } }) => {
  const { t } = useTranslation();
  const money = useMoney();
  const choice = useVariantChoice(product.variants);
  const { variant } = choice;
  const image = useImageVariant(product.images[0], {
    width: HERO_IMAGE_WIDTH,
    format: ImageFormat.Webp,
  });

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
          src={image?.url}
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
          {money(variant.priceMinor, product.currency)}
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          {variant.inStock ? t(I18n.web.store.in_stock) : t(I18n.web.store.out_of_stock)}
        </p>
        <VariantPicker choice={choice} />
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
};
