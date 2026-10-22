/**
 * Stackra file contract:
 * Purpose: `*` inside the shell: the catch-all with a way home; the chrome stays so the user is not
 *          lost.
 * Boundary: `status: 404` so the router's error boundary and the e2e tier see a real status; gen
 *           places it after every generated resource route.
 * Runtime: browser
 * Governing contract: ADR 0140, ADR 0165
 */
import { Route } from "@stackra/navigation";
import { I18n } from "#stackra/i18n";
import { NotFoundPage } from "#src/components/pages/not-found";
import { ShellLayout } from "#src/routes/shell.layout";

/** Catch-all route `*` inside the shell: a way home that keeps the chrome in place. */
@Route({
  path: "*",
  layout: ShellLayout,
  status: 404,
  component: NotFoundPage,
  title: I18n.console.errors.not_found.title,
})
export class NotFoundRoute {}
