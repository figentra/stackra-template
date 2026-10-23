/**
 * Stackra file contract:
 * Purpose: proves the site layout's loader answers an unknown host with a 404 instead of a crash,
 *          never marks a preview host indexable, builds the signup URL from the environment's
 *          origin, and asks for a fixed site by id without looking the host up.
 * Boundary: unit tier; `runRouteLoader` builds the class with the site's config and calls its
 *           loader with a fake RouteContext (request URL, env, clients, locale); the experience
 *           client is faked at the HTTP boundary.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0175, ADR 0297, ADR 0007
 */
import { fakeClient } from "@stackra/clients/testing";
import { Locale } from "@stackra/i18n";
import { describe, expect, it } from "@stackra/testing";
import { runRouteLoader } from "@stackra/testing/react";
import { GetSiteQuery, ResolveSiteQuery } from "#stackra/clients/experience";
import { SiteConfig } from "#src/config/site.config";
import { SiteLayout } from "#src/routes/site/site.layout";

/** The site the fake resolves every host to. */
const SITE = {
  id: "site_1",
  name: "Acme",
  market: { key: "sa", currency: "SAR" },
  indexable: true,
  brand: {},
};
/** The Worker env of the cases. */
const ENV = { apiUrl: "http://api.test", siteUrl: "https://www.acme.example" };

/** Guards host-to-site resolution, the first step of every request in the multi-site web app. */
describe(SiteLayout, () => {
  /** An unknown host must 404 instead of serving another site by default. */
  it("throws a 404 response when no site owns the host", async () => {
    const experience = fakeClient((fake) => fake.on(ResolveSiteQuery).returns(null));
    const run = runRouteLoader(SiteLayout, {
      url: "https://nobody.acme.example/",
      env: ENV,
      clients: [experience],
    });
    await expect(run).rejects.toMatchObject({ status: 404 });
  });

  /**
   * Preview hosts must never be indexed, and the signup link must stay on this environment's
   * origin.
   */
  it("marks preview hosts as not indexable and builds the signup URL from the env", async () => {
    const experience = fakeClient((fake) => fake.on(ResolveSiteQuery).returns(SITE));
    const { site } = await runRouteLoader(SiteLayout, {
      url: "https://preview.acme.example/ar",
      env: ENV,
      clients: [experience],
      locale: Locale.Ar,
    });
    expect(site.indexable).toBe(false);
    expect(site.dir).toBe("rtl");
    expect(site.signupUrl).toBe("https://www.acme.example/signup");
  });

  /** A single-tenant deployment pins its site, so no host is ever looked up. */
  it("asks for the fixed site by id and never resolves the host", async () => {
    const experience = fakeClient((fake) => fake.on(GetSiteQuery).returns(SITE));
    await runRouteLoader(SiteLayout, {
      url: "https://www.acme.example/",
      env: ENV,
      clients: [experience],
      config: [[SiteConfig, { fixedSiteId: "site_1" }]],
    });
    expect(experience.called(GetSiteQuery)).toEqual([{ siteId: "site_1" }]);
    expect(experience.called(ResolveSiteQuery)).toHaveLength(0);
  });
});
