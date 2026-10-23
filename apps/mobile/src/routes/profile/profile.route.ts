/**
 * Stackra file contract:
 * Purpose: the signed-in user, the active tenant with its roles, and a switcher across memberships.
 * Boundary: a route class: options only; the page's hook reads the session and the tenancy context.
 *           Roles are displayed, never edited here. The page is `profile.tsx`, bound by name; the
 *           title is `mobile::routes.profile.title`.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0206, ADR 0208
 */
import { Route } from "@stackra/navigation";

/** A pushed screen from Settings. */
export class ProfileRoute extends Route({ path: "/profile" }) {}
