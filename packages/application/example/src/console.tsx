/**
 * Stackra file contract:
 * Purpose: the console entry of @figentra/acme-example (`./console`): what the OS console shell (os/console@3) loads
 *          from this package. Its `register` export registers the package's routes under the shell's chrome.
 * Boundary: registration only; the page is `react/example-home`. Imports only what the shell's import map shares
 *           (React, React Router, @stackra/ui), so the package bundle carries no second copy (ADR 0436 decision 4).
 * Runtime: browser
 * Governing contract: ADR 0436 (decisions 2 and 4); ADR 0441 (decision 3).
 */
import type { RouteObject } from "react-router";

import { ExampleHome } from "#src/react/example-home/example-home";

// shortcut: a hand-written register function until gen writes the package's console entry from its panels (STA-339).
/** Adds the example's routes to the console. */
export function register(shell: { readonly route: (...routes: RouteObject[]) => void }): void {
  shell.route(
    { index: true, element: <ExampleHome /> },
    { path: "example", element: <ExampleHome /> },
  );
}
