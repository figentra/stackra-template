/**
 * Stackra file contract:
 * Purpose: the session provider: mounts the session context at `order` 10 and hydrates it before
 *          the first route.
 * Boundary: the folder holds this class, `session.context.tsx` and `use-actor.ts`. A signed-out
 *           answer is "no session"; any other failure is reported and also boots signed out, so a
 *           flaky BFF never crashes the app.
 * Runtime: browser
 * Governing contract: ADR 0241, ADR 0232 (reporter port)
 */
import { CoreRefusals, isRefusal } from "@stackra/errors";
import { Provider, type AppContext } from "@stackra/navigation";
import { Identity } from "#stackra/clients";
import { SessionContextProvider } from "#src/providers/session/session.context";

/** Mounts the session context at order 10 and hydrates it before the first route. */
@Provider({ component: SessionContextProvider, order: 10 })
export class SessionProvider {
  /** Runs once at boot: `/api/auth/session` through the BFF. */
  async hydrate(ctx: AppContext) {
    try {
      return await ctx.query(Identity.queries.CurrentSession, {});
    } catch (error) {
      if (!isRefusal(error, CoreRefusals.unauthenticated)) ctx.report(error);
      return null;
    }
  }
}
