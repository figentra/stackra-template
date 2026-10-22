/**
 * Stackra file contract:
 * Purpose: opens the realtime connection before the first route, so widgets with `refreshOn` and
 *          every `useSubscription` start subscribed instead of polling.
 * Boundary: a `@Provider` class because it runs code before mount (`hydrate` = connect). Signed out
 *           it connects nothing. The origin is `MobileEnv.realtimeOrigin`; the channel token is the
 *           session's, checked by the server's channel authorisation. Reconnecting on foreground is
 *           the context component's.
 * Runtime: react-native
 * Governing contract: ADR 0225, ADR 0263
 */
import { Provider, type AppContext } from "@stackra/navigation";
import type { RealtimeConnection } from "@stackra/realtime";
import type { RealtimeTransport } from "@stackra/realtime/contracts";
import { RealtimeConfig } from "#src/config/realtime.config";
import { RealtimeContextProvider } from "#src/providers/realtime/realtime.context";

/** Mounted below the tenant context: channels are per tenant. */
@Provider({ component: RealtimeContextProvider, order: 30 })
export class RealtimeProvider {
  constructor(private readonly transport: RealtimeTransport) {}

  /** The open connection, or `null` signed out. */
  async hydrate(ctx: AppContext): Promise<RealtimeConnection | null> {
    if (!ctx.session) return null;
    const realtime = ctx.config(RealtimeConfig);
    return this.transport.connect({
      origin: ctx.env.realtimeOrigin,
      tenantId: ctx.tenant?.tenantId,
      maxBackoffSeconds: realtime.maxBackoffSeconds,
    });
  }
}
