/**
 * Stackra file contract:
 * Purpose: the component folder's barrel: the inbox and its one hook.
 * Boundary: explicit exports only.
 * Runtime: browser
 * Governing contract: ADR 0128
 */
export { NotificationInbox } from "./notification-inbox";
export { useNotificationInbox } from "./use-notification-inbox";
export type { NotificationInboxState } from "./use-notification-inbox";
