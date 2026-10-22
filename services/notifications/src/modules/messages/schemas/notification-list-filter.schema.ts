/**
 * Stackra file contract:
 * Purpose: `NotificationListFilter`: cursor, limit and an unread-only switch for the inbox.
 * Boundary: one schema class and its inferred type (ADR 0006). The principal is the actor, never a
 *           filter.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, http conventions (cursor pagination),
 *                     guides/programming-model.mdx#schemas
 */
import { PageFilter, z } from "@stackra/schema";

/** Cursor, limit (1–100, default 20) and `unreadOnly`. */
export class NotificationListFilter extends PageFilter({
  unreadOnly: z.boolean().default(false),
}) {}
