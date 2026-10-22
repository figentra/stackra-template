/**
 * Stackra file contract:
 * Purpose: the store page: the search form, the grid or the empty state, and the "show more" link
 *          carrying the next cursor.
 * Boundary: presentation over Routes.store's loader data (the search index when `q` is set, the
 *           listing otherwise); the grid and card are components. Links are the store route with
 *           its search parameters.
 * Runtime: isomorphic
 * Governing contract: ADR 0221 (search behind the query), HTTP conventions (cursor pagination)
 */
import { useTranslation } from "@stackra/i18n/react";
import type { RouteComponent } from "@stackra/navigation";
import { Link, RouteForm } from "@stackra/navigation/react";
import { SearchField } from "@stackra/ui";
import { I18n } from "#stackra/i18n";
import { ProductGrid } from "#src/blocks/product-grid";
import type { StoreRoute } from "#src/routes/store.route";
import { Routes } from "#stackra/routes";

/**
 * Store page component: search form, product grid or empty state, and the "show more" cursor link.
 */
export const StorePage: RouteComponent<typeof StoreRoute> = ({ data, search }) => {
  const { t } = useTranslation();
  const next = { ...search, cursor: data.page.nextCursor };

  return (
    <>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">{t(I18n.web.store.title)}</h1>
        <RouteForm method="get" role="search" className="w-full md:w-80">
          <SearchField
            name="q"
            defaultValue={data.search ?? ""}
            aria-label={t(I18n.web.store.search)}
          />
        </RouteForm>
      </header>
      {data.page.items.length === 0 ? (
        <p role="status" className="py-16 text-center text-ink-muted">
          {t(I18n.web.store.empty)}
        </p>
      ) : (
        <ProductGrid data={data.page} limit={24} />
      )}
      {data.page.hasMore && (
        <nav className="mt-8 text-center" aria-label={t(I18n.web.store.more)}>
          <Link to={Routes.store} search={next} className="link" rel="next">
            {t(I18n.web.store.more)}
          </Link>
        </nav>
      )}
    </>
  );
};
