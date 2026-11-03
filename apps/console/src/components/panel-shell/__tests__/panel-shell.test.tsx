/**
 * Stackra file contract:
 * Purpose: renders the panel shell as the layout of a memory router and proves it wraps the child page.
 * Boundary: a memory router rendered into jsdom with react-dom; no network.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 14); ADR 0022 (test placement).
 */
import { describe, expect, it } from "@stackra/testing";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { createMemoryRouter, RouterProvider } from "react-router";

import { PanelShell } from "#src/components/panel-shell";

// React reads this flag to run `act` updates synchronously in a test.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

/** The panel shell. */
describe(PanelShell, () => {
  /** The title, the navigation landmark and the child page all render. */
  it("renders the panel title and navigation around the child page", async () => {
    const router = createMemoryRouter([
      {
        element: <PanelShell title="Console" />,
        children: [{ path: "/", element: <p>Child page</p> }],
      },
    ]);
    const host = document.body.appendChild(document.createElement("div"));
    const root = createRoot(host);
    await act(async () => root.render(<RouterProvider router={router} />));

    expect(host.querySelector("h1")?.textContent).toBe("Console");
    expect(host.querySelector('nav[aria-label="Resources"]')).not.toBeNull();
    expect(host.textContent).toContain("Child page");
    await act(async () => root.unmount());
  });
});
