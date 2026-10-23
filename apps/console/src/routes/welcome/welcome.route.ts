/**
 * Stackra file contract:
 * Purpose: `/welcome`: the default document a fresh tenant sees until it publishes its own in the
 *          page builder. The document renders the page, so the folder has no page component.
 * Boundary: `document:` makes the route adapter ask `GetDocumentQuery` (experience) for the
 *           tenant's published `console.welcome` and fall back to the class when there is none, so
 *           the console never calls the document query itself. The document's permission is derived
 *           from its blocks' queries; the title reuses the document's derived title key.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0110 (documents), ADR 0114
 */
import { Route } from "@stackra/navigation";
import { I18n } from "#stackra/i18n";
import { WelcomeDocument } from "#src/documents/welcome.document";
import { ShellLayout } from "#src/routes/shell/shell.layout";

/** Route `/welcome`: the tenant's published welcome document, or the coded default. */
export class WelcomeRoute extends Route({
  path: "/welcome",
  layout: ShellLayout,
  document: WelcomeDocument,
  title: I18n.documents.welcome.title,
}) {}
