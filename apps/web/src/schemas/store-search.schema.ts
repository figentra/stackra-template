/**
 * Stackra file contract:
 * Purpose: the store listing's query string: the search text, the collection filter and the cursor
 *          of the page being shown, so `ctx.search` in the loader and the links the grid writes
 *          share one typed shape.
 * Boundary: one schema class, value and type under one name; an unknown parameter is dropped, a
 *           malformed one is ignored rather than a 400, because a shared link must still open.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0221 (search behind the query), HTTP conventions (cursor
 *                     pagination)
 */
import { Schema, z } from "@stackra/schema";

/** `?q=tee&collection=summer&cursor=…`; every field optional. */
export class StoreSearch extends Schema(
  z.object({
    q: z.string().trim().max(120).optional().catch(undefined),
    collection: z.string().trim().max(64).optional().catch(undefined),
    cursor: z.string().max(512).optional().catch(undefined),
  }),
) {}
