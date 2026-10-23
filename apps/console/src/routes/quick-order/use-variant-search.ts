/**
 * Stackra file contract:
 * Purpose: the variant picker's data: searches `SearchVariants` with the typed text, keeping the
 *          previous page while the next loads so the list never blanks.
 * Boundary: the quick-order page's own hook, beside it in the route folder; the query, its cache
 *           and offline reads are the clients package's. Below two characters nothing is asked,
 *           matching the query's own minimum.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 14), ADR 0079
 */
import { useQuery } from "@stackra/clients/react";
import { Commerce, type VariantHit } from "#stackra/clients";

/** What the hook returns. */
export interface VariantSearchState {
  /** Hits for the combo box; empty before the first search. */
  readonly items: readonly VariantHit[];
  /** True while a search is in flight. */
  readonly isLoading: boolean;
}

/** The query's own lower bound on `q`; shorter text would be refused, so it is never sent. */
const MIN_QUERY_LENGTH = 2;

/** Items for the combo box and whether a search is in flight. */
export function useVariantSearch(q: string): VariantSearchState {
  const result = useQuery(
    Commerce.queries.SearchVariants,
    { q, limit: 20 },
    { keepPreviousData: true, enabled: q.length >= MIN_QUERY_LENGTH },
  );
  return { items: result.data?.items ?? [], isLoading: result.isPending };
}
