/**
 * Stackra file contract:
 * Purpose: proves the root module boots from the generated wiring with the testing drivers, binds
 *          each package config override to its base class, and mounts the package contexts from
 *          their config classes in graph order (the site writes no provider).
 * Boundary: unit tier on the container: no network; drivers are the testing fakes the wiring
 *           names.
 * Runtime: node
 * Governing contract: ADR 0022, ADR 0263, ADR 0294 (decision 19), ADR 0295 (decisions 9 and 10)
 */
import { ConsentConfig } from "@stackra/consent";
import { createTestingModule } from "@stackra/container/testing";
import { I18nConfig } from "@stackra/i18n";
import { describe, expect, it } from "@stackra/testing";
import { wiring } from "#stackra/wiring";
import { WebConsentConfig } from "#src/config/consent.config";
import { WebI18nConfig } from "#src/config/i18n.config";
import { WebModule } from "#src/web.module";

/** Builds the site the way `.stackra/entry/worker.ts` does. */
function compile() {
  return createTestingModule(WebModule, {
    wiring,
    drivers: createTestingModule.fakes(),
  }).compile();
}

/** Guards site boot, where a missing binding breaks every page. */
describe(WebModule, () => {
  /** A package resolving its base config class must get the site's override. */
  it("binds the config overrides to their base classes", async () => {
    const app = await compile();
    expect(app.get(I18nConfig)).toBeInstanceOf(WebI18nConfig);
    expect(app.get(ConsentConfig)).toBeInstanceOf(WebConsentConfig);
  });

  /**
   * The site context and the toast provider the site used to list are gone: contexts come from
   * config classes, in the order ADR 0295 fixes, and consent wraps analytics.
   */
  it("mounts the package contexts from their config classes in graph order", async () => {
    const app = await compile();
    const mounted = app.contexts().map((context) => context.key);
    expect(mounted.indexOf("consent")).toBeLessThan(mounted.indexOf("analytics"));
    expect(mounted).not.toContain("site");
    expect(mounted.at(-1)).toBe("ui"); // the UI kit with its toasts, innermost
  });
});
