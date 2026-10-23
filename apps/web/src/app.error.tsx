/**
 * Stackra file contract:
 * Purpose: the site's root error boundary: a thrown 404 (unknown host, slug or page path) is the
 *          not-found page with a way home; anything else is the error page with the gateway's error
 *          id and, in development, the stack.
 * Boundary: presentation only; errors bubble here from every route and the site layout, and the
 *           generated root renders it for what happens above them. Reporting happened where the
 *           error was thrown (the entries report each error once); the 404 log is the Worker's.
 *           `useRouteErrorInfo` reads the status and the error envelope's reference id, so nothing
 *           here casts `error.data`. The home link is the landing route key, so it lands in the
 *           locale mount the visitor was on. Development is read from the validated env, never
 *           `import.meta.env`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 14: `app.error.tsx`), ADR 0140 (error envelope carries an
 *                     error id)
 */
import { useTranslation } from "@stackra/i18n/react";
import { Link, useRouteErrorInfo } from "@stackra/navigation/react";
import { env } from "#stackra/env";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";

/** `role="alert"` on the 5xx body so it is announced; the 404 is a plain page. */
export function AppErrorBoundary() {
  const { t } = useTranslation();
  const { status, reference, error } = useRouteErrorInfo();

  if (status === 404) {
    return (
      <main id="main" className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t(I18n.web.error_page.not_found.title)}
        </h1>
        <p className="mt-2 text-ink-muted">{t(I18n.web.error_page.not_found.body)}</p>
        <Link to={Routes.landing} className="link mt-6 inline-block">
          {t(I18n.web.error_page.not_found.home)}
        </Link>
      </main>
    );
  }

  const stack = env.isDevelopment && error instanceof Error ? error.stack : undefined;
  return (
    <main id="main" role="alert" className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">
        {t(I18n.web.error_page.server.title)}
      </h1>
      <p className="mt-2 text-ink-muted">{t(I18n.web.error_page.server.body)}</p>
      {reference && (
        <p className="mt-4 font-mono text-sm">
          {t(I18n.web.error_page.server.reference, { reference })}
        </p>
      )}
      {stack && <pre className="mt-8 overflow-auto text-start text-xs">{stack}</pre>}
    </main>
  );
}
