/**
 * Stackra file contract:
 * Purpose: the params of `OrderDetailRoute`: one order public id, validated before the page mounts
 *          (deep links included).
 * Boundary: a schema class (value and type under one name); a public id, never a record (ADR 0082).
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0082
 */
import { PublicId, Schema, z } from "@stackra/schema";

/**
 * `orders/:orderId`; a malformed id refuses the deep link with `validation` before any query
 * runs.
 */
export class OrderDetailParams extends Schema(z.object({ orderId: PublicId("ord") })) {}
