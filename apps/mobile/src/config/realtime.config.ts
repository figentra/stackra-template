/**
 * Stackra file contract:
 * Purpose: this app's override of @stackra/realtime's configuration on the device: where the
 *          connection goes, when it reconnects and how long it waits before it gives up for this
 *          launch.
 * Boundary: an override declares `override` members only and inherits the base's key (`realtime`);
 *           its presence mounts the realtime context, so the app writes no realtime provider. The
 *           package connects after sign-in with the session's channel token, per tenant, and
 *           connects nothing signed out; channel authorisation is the server's (commerce
 *           `realtime.config.ts`). A phone drops the socket in the background, so the connection
 *           is suspended after the grace period and resumed on foreground; widgets refresh through
 *           it on their `refreshOn` events.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 19), ADR 0295 (decision 10), ADR 0225, ADR 0250
 */
import { Env } from "@stackra/config";
import type { Url } from "@stackra/contracts";
import { RealtimeConfig } from "@stackra/realtime";

/** Reconnect on foreground with capped backoff; subscriptions resume where they were. */
export class MobileRealtimeConfig extends RealtimeConfig {
  /** Origin of the realtime gateway (`ws:` or `wss:`). */
  @Env("EXPO_PUBLIC_REALTIME_ORIGIN")
  override origin!: Url;

  /** Reconnect when the app returns to the foreground. */
  override reconnectOnForeground = true;

  /** Close the socket after this many seconds in the background, to spare the battery. */
  override backgroundGraceSeconds = 30;

  /** The longest wait between reconnect attempts, in seconds. */
  override maxBackoffSeconds = 60;
}
