/**
 * Stackra file contract:
 * Purpose: proves the home route sits at `/` and its page renders the empty-panel message.
 * Boundary: a memory router rendered into jsdom with react-dom; no network.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 14); ADR 0022 (test placement).
 */
import { kindOf } from "@stackra/container";
import { describe, expect, it } from "@stackra/testing";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { createMemoryRouter, RouterProvider } from "react-router";

import { Home } from "#src/routes/home/home";
import { HomeRoute } from "#src/routes/home/home.route";

// React reads this flag to run `act` updates synchronously in a test.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

/** The home route. */
describe(HomeRoute, () => {
  /** The page at the route's path shows the empty-panel message. */
  it("renders its page at /", async () => {
    expect(kindOf(HomeRoute)?.options).toMatchObject({ path: "/" });
    const router = createMemoryRouter([{ path: "/", element: <Home /> }]);
    const host = document.body.appendChild(document.createElement("div"));
    const root = createRoot(host);
    await act(async () => root.render(<RouterProvider router={router} />));

    expect(host.textContent).toBe("No resources registered yet.");
    await act(async () => root.unmount());
  });
});
