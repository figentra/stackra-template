/**
 * Stackra file contract:
 * Purpose: the store listing's query string: the search text, the collection filter and the cursor
 *          of the page being shown, so `ctx.search` in the loader and the links the grid writes
 *          share one typed shape.
 * Boundary: a shape class the route names as `search`; an unknown parameter is dropped, a
 *           malformed one is ignored rather than a 400, because a shared link must still open.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 6), ADR 0095, ADR 0221 (search behind the query),
 *                     HTTP conventions (cursor pagination)
 */
import { Field, Schema } from "@stackra/validation";
import { z } from "zod";

/** `?q=tee&collection=summer&cursor=…`; every field optional. */
export class StoreSearch extends Schema {
  /** The search text, up to 120 characters. */
  // reason: a malformed value is dropped (`catch`), which no field decorator expresses
  @Field(z.string().trim().max(120).optional().catch(undefined))
  q?: string;

  /** A collection slug, up to 64 characters. */
  // reason: as `q`, a malformed value is dropped rather than refused
  @Field(z.string().trim().max(64).optional().catch(undefined))
  collection?: string;

  /** The opaque cursor of the page being shown. */
  // reason: as `q`, a malformed value is dropped rather than refused
  @Field(z.string().max(512).optional().catch(undefined))
  cursor?: string;
}
