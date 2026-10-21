/**
 * Stackra file contract:
 * Purpose: the in-app notification inbox the notifications service keeps for the signed-in user.
 * Boundary: options only; the page's hook owns the paginated query. The inbox is the caller's own,
 *           so the route needs a session and no permission.
 * Runtime: react-native
 * Governing contract: ADR 0062
 */
import { Presentation, Route } from "@stackra/navigation";
import { InboxPage } from "#src/components/pages/inbox";
import { I18n } from "#stackra/i18n";

/** A pushed card from Home and Settings. */
@Route({
  path: "/inbox",
  auth: true,
  presentation: Presentation.Card,
  header: { title: I18n.mobile.inbox.title },
  component: InboxPage,
})
export class InboxRoute {}
