/**
 * Stackra file contract:
 * Purpose: `InboxMessageView`: one inbox entry as the console and the mobile inbox render it.
 * Boundary: a shape class (an output view, so `<X>View`); never the model. In schemas/ because the
 *           list query pages it and the mark-read action returns it. The timestamps are `Date` in
 *           code and ISO 8601 with an offset on the wire (the Date codec).
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 13 and 26)
 */
import type { PublicId } from "@stackra/contracts";
import { Field, Schema } from "@stackra/validation";
import { z } from "zod";
import type { InboxMessageKind } from "#modules/messages/enums/inbox-message-kind.enum";

/** `readAt` is null while the entry is unread. */
export class InboxMessageView extends Schema {
  /** The entry's public id (`inm_…`). */
  id!: PublicId<"inm">;

  /** What the entry is about; the client renders the kind's label with `data`. */
  kind!: InboxMessageKind;

  /** The values the label interpolates. */
  // reason: label values are ids or amounts, and a map of a scalar union has no field type
  @Field(z.record(z.string(), z.union([z.string(), z.number()])))
  data!: Record<string, string | number>;

  /** When the entry was created. */
  createdAt!: Date;

  /** When the principal opened it. */
  readAt!: Date | null;
}
