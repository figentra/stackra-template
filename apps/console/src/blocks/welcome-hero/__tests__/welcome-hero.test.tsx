/**
 * Stackra file contract:
 * Purpose: proves the hero navigates through the router on its call to action, and that the block's
 *          props refuse a call to action that is not one of the console's route keys.
 * Boundary: unit tier, jsdom; the renderer under the testing router, the props through `validate`
 *           with the schema gen compiled from the block class.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0110 d6
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen, userEvent } from "@stackra/testing/react";
import { validate } from "@stackra/validation";
import { I18n } from "#stackra/i18n";
import { WelcomeHero } from "#src/blocks/welcome-hero/welcome-hero";
import { WelcomeHeroBlock } from "#src/blocks/welcome-hero/welcome-hero.block";

/** Guards the welcome hero, whose action target comes from configurable data. */
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
    expect(validate(WelcomeHeroBlock, { ...keys, action: offApp }).success).toBe(false);
  });
});
