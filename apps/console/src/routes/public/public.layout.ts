/**
 * Stackra file contract:
 * Purpose: the frame for routes that need no session (`SignInRoute`): a centred page with the brand
 *          mark and no chrome. Its component is `public.tsx` beside it, bound by name.
 * Boundary: no options, no loader and no data, so the class is bare; the locale and theme contexts
 *           still apply (`createApp` mounts them above the router). An error below it bubbles to
 *           the root boundary `@stackra/navigation` owns.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0241 (login outside the shell)
 */
import { Layout } from "@stackra/navigation";

/** Frame for routes that need no session: a centred page with the brand mark and no chrome. */
export class PublicLayout extends Layout {}
