/**
 * Stackra file contract:
 * Purpose: `/welcome`: the default L2 document a fresh tenant sees until it publishes its own in
 *          the page builder.
 * Boundary: `document:` makes the route adapter ask `Experience.queries.GetDocument` for the
 *           tenant's published `console.welcome` and fall back to the class when there is none, so
 *           the console never calls the document query itself. The document carries its own
 *           permission.
 * Runtime: browser
 * Governing contract: ADR 0110 (L2 documents), ADR 0114
 */
import { Route } from "@stackra/navigation";
import { I18n } from "#stackra/i18n";
import { WelcomeDocument } from "#src/documents/welcome.document";
import { ShellLayout } from "#src/routes/shell.layout";

/** Route `/welcome`: the tenant's published welcome document, or the coded default. */
@Route({
  path: "/welcome",
  layout: ShellLayout,
  document: WelcomeDocument,
  meta: { title: I18n.console.pages.welcome },
})
export class WelcomeRoute {}
