/**
 * Stackra file contract:
 * Purpose: `/open-file`: the PWA file handler. Opening a PNG, JPEG or WebP with the installed
 *          console from the operating system lands here (pwa.config.ts `manifest.fileHandlers`, one
 *          client: the window already open is reused). Its page is `open-file.tsx` beside it, bound
 *          by name.
 * Boundary: the files arrive through the browser's launch queue while the page runs, not in the
 *           URL, so the route has no loader; the page reads them through the platform package. On
 *           the desktop target the same path receives files opened with the app. Inside the shell;
 *           the attach action checks its own permission. Gen adds the locale prefix to the
 *           manifest's action per locale. The title is `pages::open_file.title`.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0255 (file handlers), ADR 0250
 *                     (capability ports)
 */
import { Route } from "@stackra/navigation";
import { I18n } from "#stackra/i18n";
import { ShellLayout } from "#src/routes/shell/shell.layout";

/** Route `/open-file`: images opened with the console, ready to attach to a product. */
export class OpenFileRoute extends Route({
  path: "/open-file",
  layout: ShellLayout,
  title: I18n.pages.open_file.title,
}) {}
