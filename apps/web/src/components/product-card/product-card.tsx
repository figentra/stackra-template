/**
 * Stackra file contract:
 * Purpose: one product in a grid: image, title, price in the market currency, stock line; the whole
 *          card is a link.
 * Boundary: presentation of a storefront card from the generated client; the image is a sized
 *           variant from `@stackra/media`, so a list never downloads a full-size image (ADR 0183
 *           LCP and transfer budget).
 * Runtime: browser
 * Governing contract: ADR 0294 d14, ADR 0222 (public assets and image variants), ADR 0135 (slugs in
 *                     URLs, not ids)
 */
import { useMoney, useTranslation } from "@stackra/i18n/react";
import { ImageFormat } from "@stackra/media";
import { useImageVariant } from "@stackra/media/react";
import { Link } from "@stackra/navigation/react";
import { Card } from "@stackra/ui";
import type { StorefrontProductCard } from "#stackra/clients";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";

/** The card's data and whether it is above the fold. */
export interface ProductCardProps {
  /** One item of the storefront listing. */
  readonly product: StorefrontProductCard;
  /** True for the first row: the image loads eagerly with high priority; the rest are lazy. */
  readonly isPriority?: boolean;
}

/** The variant width; the box is square, so height equals width. */
const CARD_IMAGE_WIDTH = 480;

/** Fixed 1:1 image box with width and height so the grid never shifts while images load (CLS). */
export function ProductCard({ product, isPriority = false }: ProductCardProps) {
  const { t } = useTranslation();
  const money = useMoney();
  const image = useImageVariant(product.image, {
    width: CARD_IMAGE_WIDTH,
    format: ImageFormat.Webp,
  });
  return (
    <Card
      render={
        <Link to={Routes.product} params={{ slug: product.slug }} aria-label={product.title} />
      }
      className="h-full"
    >
      <Card.Content>
        <img
          src={image?.url}
          alt=""
          width={CARD_IMAGE_WIDTH}
          height={CARD_IMAGE_WIDTH}
          loading={isPriority ? "eager" : "lazy"}
          fetchPriority={isPriority ? "high" : "auto"}
          className="aspect-square w-full rounded-field bg-surface/10 object-cover"
        />
        <Card.Title className="mt-3">{product.title}</Card.Title>
        <p className="mt-1 font-medium">{money(product.priceMinor, product.currency)}</p>
        <p className="text-sm text-ink-muted">
          {product.inStock ? t(I18n.web.store.in_stock) : t(I18n.web.store.out_of_stock)}
        </p>
      </Card.Content>
    </Card>
  );
}
