/**
 * Stackra file contract:
 * Purpose: the ./contracts entry of the notifications service: the types and codes of its public
 *          actions and events .
 * Boundary: types and codes only, no behaviour. Gen projects it into .stackra/app-manifest.json;
 *           consumers (commerce's generated NotificationsClient) never import it.
 * Runtime: isomorphic
 * Governing contract: ADR 0117, 0158, 0260
 */
export type { SendMessageInput } from "#modules/messages/schemas/send-message-input.schema";
export type { SendMessageOutput } from "#modules/messages/schemas/send-message-output.schema";
export type { NotificationView } from "#modules/messages/schemas/notification-view.schema";
export type { NotificationPage } from "#modules/messages/schemas/notification-page.schema";
export type { MarkNotificationReadInput } from "#modules/messages/schemas/mark-notification-read-input.schema";
export { MessageStatus } from "#modules/messages/enums/message-status.enum";
export { NotificationKind } from "#modules/messages/enums/notification-kind.enum";
export { MessageSent } from "#modules/messages/events/message-sent.event";
