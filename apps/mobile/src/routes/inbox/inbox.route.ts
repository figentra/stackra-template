/**
 * Stackra file contract:
 * Purpose: the in-app notification inbox the notifications service keeps for the signed-in user.
 * Boundary: a route class: options only; the page's hook owns the paginated query. The inbox is the
 *           caller's own, so the route needs a session (the default) and no permission. The page is
 *           `inbox.tsx`, bound by name; the title is `pages::inbox.title`.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0062
 */
import { Route } from "@stackra/navigation";

/** A pushed screen from Home and Settings. */
export class InboxRoute extends Route({ path: "/inbox" }) {}
