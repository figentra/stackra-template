/**
 * Stackra file contract:
 * Purpose: the signed-in user, the active tenant with its roles, and a switcher across memberships.
 * Boundary: options only; the page reads the session and the tenant hook. Roles are displayed,
 *           never edited here.
 * Runtime: react-native
 * Governing contract: ADR 0206, ADR 0208
 */
import { Presentation, Route } from "@stackra/navigation";
import { ProfilePage } from "#src/components/pages/profile";
import { I18n } from "#stackra/i18n";

/** A pushed card from Settings. */
@Route({
  path: "/profile",
  auth: true,
  presentation: Presentation.Card,
  header: { title: I18n.mobile.profile.title },
  component: ProfilePage,
})
export class ProfileRoute {}
