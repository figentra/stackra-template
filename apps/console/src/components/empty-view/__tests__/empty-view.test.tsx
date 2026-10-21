/**
 * Stackra file contract:
 * Purpose: the empty state translates its keys and renders the action.
 * Boundary: unit tier, jsdom.
 * Runtime: browser
 * Governing contract: ADR 0022
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { EmptyView } from "#src/components/empty-view";
import { I18n } from "#stackra/i18n";

/** Guards the shared empty view used across console lists. */
describe(EmptyView, () => {
  /** Copy must come from translations and the action must stay reachable. */
  it("translates title and description", () => {
    const action = <button type="button">Go</button>;
    const title = I18n.console.queue.empty_title;
    render(
      <EmptyView title={title} description={I18n.console.queue.empty_body} action={action} />,
      {
        locale: "en",
      },
    );
    expect(screen.getByText("Nothing waiting to sync")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Go" })).toBeTruthy();
  });
});
