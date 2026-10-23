/**
 * Stackra file contract:
 * Purpose: what an in-app inbox entry is about; decides its icon and the label the console and the
 *          mobile inbox render with the entry's data.
 * Boundary: an `Enum.of` value plus the type of the same name; the code is stored on the
 *           InboxMessage row. Labels are the derived i18n keys
 *           `messages::enums.inbox_message_kind.<code>`, ICU messages that interpolate the entry's
 *           data.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 16 and 20), ADR 0231 (snake_case codes), ADR 0192
 */
import { Enum } from "@stackra/validation";

/** The kinds of inbox entry this service writes. */
export const InboxMessageKind = Enum.of({
  OrderPaid: "order_paid",
});

/** One of the codes above. */
export type InboxMessageKind = Enum.Value<typeof InboxMessageKind>;
