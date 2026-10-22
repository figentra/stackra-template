/**
 * Stackra file contract:
 * Purpose: proves an unknown host is a 404 not a crash, preview hosts are never indexable, the
 *          signup URL follows the environment's origin, and one request resolves the site once
 *          however many loaders ask.
 * Boundary: unit tier; the experience client is faked at the HTTP boundary; `routeContextFor` is
 *           the navigation package's testing fake of a route context (request, env, config,
 *           locale).
 * Runtime: node
 * Governing contract: ADR 0022, ADR 0175, ADR 0007
 */
import { fakeClient } from "@stackra/clients/testing";
import { Locale } from "@stackra/i18n";
import { routeContextFor } from "@stackra/navigation/testing";
import { describe, expect, it } from "@stackra/testing";
import { Experience } from "#stackra/clients";
import { resolveSite } from "#src/server/resolve-site.server";

/** The site the fake resolves every host to. */
const SITE = {
  id: "site_1",
  name: "Acme",
  market: { key: "sa", currency: "SAR" },
  indexable: true,
  brand: {},
};
/** The Worker env of the cases. */
const ENV = { apiUrl: "http://api.test", siteUrl: "https://www.example.com" };

/** Guards host-to-site resolution, the first step of every request in the multi-site web app. */
describe(resolveSite, () => {
  /** An unknown host must 404 instead of serving another site by default. */
  it("throws a 404 response when no site owns the host", async () => {
    const experience = fakeClient(Experience, (fake) => fake.queries.ResolveSite.returns(null));
    const ctx = routeContextFor("https://nobody.example.com/", { env: ENV, clients: [experience] });
    await expect(resolveSite(ctx)).rejects.toMatchObject({ status: 404 });
  });

  /**
   * Preview hosts must never be indexed, and the signup link must stay on this environment's
   * origin.
   */
  it("marks preview hosts as not indexable and builds the signup URL from the env", async () => {
    const experience = fakeClient(Experience, (fake) => fake.queries.ResolveSite.returns(SITE));
    const ctx = routeContextFor("https://preview.example.com/ar", {
      env: ENV,
      clients: [experience],
      locale: Locale.Ar,
    });
    const site = await resolveSite(ctx);
    expect(site.indexable).toBe(false);
    expect(site.dir).toBe("rtl");
    expect(site.signupUrl).toBe("https://www.example.com/signup");
  });

  /** Loaders share one site lookup per request, or each page would multiply service calls. */
  it("calls the experience service once per request however many loaders ask", async () => {
    const experience = fakeClient(Experience, (fake) => fake.queries.ResolveSite.returns(SITE));
    const ctx = routeContextFor("https://www.example.com/", { env: ENV, clients: [experience] });
    await Promise.all([resolveSite(ctx), resolveSite(ctx)]);
    expect(experience.called(Experience.queries.ResolveSite)).toHaveLength(1);
  });
});
