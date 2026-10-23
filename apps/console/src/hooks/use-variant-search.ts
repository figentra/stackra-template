/**
 * Stackra file contract:
 * Purpose: the variant pickers' data: searches `SearchVariantsQuery` with the typed text, keeping
 *          the previous page while the next loads so the list never blanks. Read by the quick-order
 *          page and the attach-images form, so it sits in the app's `hooks/` group.
 * Boundary: the query, its cache and offline reads are the clients package's. Below two characters
 *           nothing is asked, matching the query's own minimum.
 * Runtime: browser
 * Governing contract: ADR 0294 decision 14 (`hooks/` holds a hook with two or more importers), ADR
 *                     0079
 */
import { useQuery } from "@stackra/clients/react";
import { SearchVariantsQuery } from "#stackra/clients/commerce";
import type { VariantSearchState } from "#src/types/variant-search-state.type";

/** The query's own lower bound on `q`; shorter text would be refused, so it is never sent. */
const MIN_QUERY_LENGTH = 2;

/** Items for the combo box and whether a search is in flight. */
export function useVariantSearch(q: string): VariantSearchState {
  const result = useQuery(
    SearchVariantsQuery,
    { q, limit: 20 },
    { keepPreviousData: true, enabled: q.length >= MIN_QUERY_LENGTH },
  );
  return { items: result.data?.items ?? [], isLoading: result.isPending };
}
