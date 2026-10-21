/**
 * Stackra file contract:
 * Purpose: the frame for routes that need no session (`SignInRoute`): a centred page with the brand
 *          mark, no chrome.
 * Boundary: no guard, no navigation, no data; the locale and theme providers still apply (they sit
 *           above the router).
 * Runtime: browser
 * Governing contract: ADR 0241 (login outside the shell), ADR 0165
 */
import { Layout, LayoutKind } from "@stackra/navigation";
import { PublicFrame } from "#src/components/public-frame";
import { RouteErrorState } from "#src/components/error-state";

/** Frame for routes that need no session: a centred page with the brand mark and no chrome. */
@Layout({ kind: LayoutKind.Page, component: PublicFrame, errorBoundary: RouteErrorState })
export class PublicLayout {}
