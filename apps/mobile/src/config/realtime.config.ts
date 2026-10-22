/**
 * Stackra file contract:
 * Purpose: one fact: the realtime connection on the device: when it reconnects and how long it
 *          waits before it gives up for this launch.
 * Boundary: values only. The origin is the public env (`MobileEnv.realtimeOrigin`); channel
 *           authorisation is the server's (commerce `realtime.config.ts`). A phone drops the socket
 *           in the background, so the provider reconnects on foreground; widgets refresh through
 *           this connection on their `refreshOn` events.
 * Runtime: react-native
 * Governing contract: ADR 0225, ADR 0250
 */
import { Config } from "@stackra/config";
import { Bool, Int } from "@stackra/validation";

/** Reconnect on foreground with capped backoff; subscriptions resume where they were. */
@Config("mobile.realtime")
export class RealtimeConfig {
  /** Reconnect when the app returns to the foreground. @defaultValue true */
  @Bool() reconnectOnForeground = true;
  /**
   * Close the socket after this many seconds in the background, to spare the battery. @defaultValue
   * 30
   */
  @Int({ min: 0 }) backgroundGraceSeconds = 30;
  /** The longest wait between reconnect attempts, in seconds. @defaultValue 60 */
  @Int({ min: 1 }) maxBackoffSeconds = 60;
}
