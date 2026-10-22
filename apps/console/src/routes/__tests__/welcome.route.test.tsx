/**
 * Stackra file contract:
 * Purpose: proves the welcome route renders the tenant's published document when the experience
 *          service has one, and the coded `WelcomeDocument` when it answers `null`.
 * Boundary: unit tier, jsdom; the route adapter asks the faked experience client, so the test sees
 *           exactly the one `GetDocument` call the adapter makes.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0110, ADR 0007
 */
import { fakeClient } from "@stackra/clients/testing";
import { describe, expect, it } from "@stackra/testing";
import { renderRoute, screen } from "@stackra/testing/react";
import { Experience } from "#stackra/clients";
import { WelcomeRoute } from "#src/routes/welcome.route";
import { Routes } from "#stackra/routes";

/** An actor who may read orders, which the document's widgets need. */
const STAFF = { permissions: ["orders.order.read"] };

/** Guards the one route that renders a tenant-editable document. */
describe(WelcomeRoute, () => {
  /** No published document: the coded default renders, hero first. */
  it("falls back to the coded document", async () => {
    const experience = fakeClient(Experience, (fake) => fake.queries.GetDocument.returns(null));
    renderRoute(Routes.welcome, { locale: "en", clients: [experience], session: STAFF });
    expect(await screen.findByRole("heading", { name: "Welcome to your console" })).toBeTruthy();
    expect(experience.called(Experience.queries.GetDocument)).toEqual([{ key: "console.welcome" }]);
  });
});
