/**
 * Stackra file contract:
 * Purpose: `*` inside the shell: the catch-all with a way home; the chrome stays so the user is not
 *          lost. Its page is `not-found.tsx` beside it, bound by name.
 * Boundary: `status: 404` so the router's error boundary and the e2e tier see a real status; gen
 *           places it after every generated panel route. The title reuses the page's heading key.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0140, ADR 0165
 */
import { Route } from "@stackra/navigation";
import { I18n } from "#stackra/i18n";
import { ShellLayout } from "#src/routes/shell/shell.layout";

/** Catch-all route `*` inside the shell: a way home that keeps the chrome in place. */
export class NotFoundRoute extends Route({
  path: "*",
  layout: ShellLayout,
  status: 404,
  title: I18n.console.errors.not_found.title,
}) {}
