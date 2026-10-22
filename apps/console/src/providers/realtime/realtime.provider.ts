/**
 * Stackra file contract:
 * Purpose: connects the realtime client before the first route, so a widget's `refreshOn` and a
 *          component's `useSubscription` work from the first paint, and joins the active tenant's
 *          channel.
 * Boundary: the folder holds this class, `realtime.context.tsx` and `use-realtime.ts`. The
 *           transport is the realtime port (gen picks the driver); the channel is authorised
 *           server-side by the producer's channel rule, so a client can only join its own tenant.
 *           Signed out, nothing connects.
 * Runtime: browser
 * Governing contract: ADR 0225 (broadcast), ADR 0142 (transport behind a port)
 */
import { Provider, type AppContext } from "@stackra/navigation";
import type { RealtimeConnection } from "@stackra/realtime";
import type { RealtimeTransport } from "@stackra/realtime/contracts";
import { RealtimeContextProvider } from "#src/providers/realtime/realtime.context";

/** Mounts the realtime context at order 30, after the session and the tenant it needs. */
@Provider({ component: RealtimeContextProvider, order: 30 })
export class RealtimeProvider {
  constructor(private readonly transport: RealtimeTransport) {}

  /**
   * Opens the socket to the realtime origin; `null` when signed out, so the indicator shows
   * nothing.
   */
  async hydrate(ctx: AppContext): Promise<RealtimeConnection | null> {
    if (!ctx.session) return null;
    return this.transport.connect({
      origin: ctx.env.realtimeOrigin,
      tenantId: ctx.tenant?.tenantId,
    });
  }
}
