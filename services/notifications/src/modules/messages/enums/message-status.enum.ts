/**
 * Stackra file contract:
 * Purpose: where a message is in its short life: queued, sent, or failed after its retries.
 * Boundary: an `Enum.of` value plus the type of the same name; the code is the wire and column
 *           value, the tone colours it in the console. No state machine: MessageService is the only
 *           writer and the moves are queued → sent and queued → failed. Labels are the derived i18n
 *           keys `messages::enums.message_status.<code>`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 16 and 20), ADR 0231 (snake_case codes)
 */
import { Enum, Tone } from "@stackra/contracts";

/** `failed` is what the dead-letter path writes; a redrive can still end in `sent`. */
export const MessageStatus = Enum.of({
  Queued: ["queued", { tone: Tone.Warning }],
  Sent: ["sent", { tone: Tone.Success }],
  Failed: ["failed", { tone: Tone.Danger }],
});

/** One of the codes above. */
export type MessageStatus = Enum.Value<typeof MessageStatus>;
