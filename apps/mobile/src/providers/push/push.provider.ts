/**
 * Stackra file contract:
 * Purpose: prepares push before the first frame: the foreground presentation rule and the Android
 *          channels, so a notification that arrives during boot is already shown the configured
 *          way.
 * Boundary: a `@Provider` class because it runs code before mount; it never prompts and never
 *           registers (that waits for a session and a tenant, in `push.context.tsx`). A target
 *           without push ends quietly: push is optional.
 * Runtime: react-native
 * Governing contract: ADR 0062, ADR 0250, ADR 0263
 */
import { Provider, type AppContext } from "@stackra/navigation";
import { PushConfig } from "#src/config/push.config";
import { PushContextProvider } from "#src/providers/push/push.context";

/** Mounted below session, tenant, query and realtime. */
@Provider({ component: PushContextProvider, order: 40 })
export class PushProvider {
  /** Applies the foreground rule and creates the Android channels from `PushConfig`. */
  async hydrate(ctx: AppContext): Promise<void> {
    const push = ctx.capability("push", { required: false });
    if (!push) return;
    const config = ctx.config(PushConfig);
    push.setForegroundPresentation({
      banner: config.foregroundBanner,
      sound: config.foregroundSound,
      badge: config.foregroundBadge,
    });
    await push.ensureChannels(config.androidChannels);
  }
}
