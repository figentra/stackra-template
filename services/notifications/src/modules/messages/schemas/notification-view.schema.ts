/**
 * Stackra file contract:
 * Purpose: `NotificationView`: one inbox entry as the console and mobile inbox render it.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, guides/programming-model.mdx#schemas; ADR 0127
 */
import { Schema, z } from "@stackra/schema";
import { NotificationKind } from "#modules/messages/enums/notification-kind.enum";

/** The entry's id, kind, label data and timestamps (ISO 8601); `readAt` is null while unread. */
export class NotificationView extends Schema(
  z.object({
    id: z.string(),
    kind: NotificationKind.schema,
    data: z.record(z.string(), z.union([z.string(), z.number()])),
    createdAt: z.iso.datetime(),
    readAt: z.iso.datetime().nullable(),
  }),
) {}
