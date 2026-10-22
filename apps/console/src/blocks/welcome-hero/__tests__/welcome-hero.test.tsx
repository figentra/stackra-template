/**
 * Stackra file contract:
 * Purpose: the block renders its keys and the call to action navigates through the router by route
 *          key; props that name anything but a route key are refused by the schema.
 * Boundary: unit tier, jsdom; the memory router of the testing providers.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0110
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen, userEvent } from "@stackra/testing/react";
import { WelcomeHero } from "#src/blocks/welcome-hero";
import { WelcomeHeroProps } from "#src/schemas/welcome-hero.schema";
import { I18n } from "#stackra/i18n";

/** Guards the dashboard hero, whose action target comes from configurable data. */
describe(WelcomeHero, () => {
  /** The call to action must move the user through the router. */
  it("navigates on the call to action", async () => {
    const action = { labelKey: I18n.console.welcome.cta, route: "quick_order" } as const;
    const hero = (
      <WelcomeHero
        titleKey={I18n.console.welcome.title}
        bodyKey={I18n.console.welcome.body}
        action={action}
      />
    );
    const { router } = render(hero, { locale: "en" });
    await userEvent.click(screen.getByRole("button", { name: "Place your first order" }));
    expect(router.state.location.pathname).toBe("/quick-order");
  });

  /** A URL or an unknown key is not a route key, so a document can never redirect off the app. */
  it("refuses a call to action that is not a route key", () => {
    const keys = { titleKey: I18n.console.welcome.title, bodyKey: I18n.console.welcome.body };
    const offApp = { labelKey: I18n.console.welcome.cta, route: "https://evil.example" };
    expect(WelcomeHeroProps.safeParse({ ...keys, action: offApp }).success).toBe(false);
  });
});
