/**
 * Stackra file contract:
 * Purpose: the loading state is a labelled busy region in both variants.
 * Boundary: unit tier, jsdom.
 * Runtime: browser
 * Governing contract: ADR 0022
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { LoadingState } from "#src/components/loading-state";
import { I18n } from "#stackra/i18n";

/** Guards the shared loading view that other components rely on. */
describe(LoadingState, () => {
  /** Assistive tech must hear a translated busy status while content loads. */
  it("is an aria-busy status with a translated label", () => {
    render(<LoadingState label={I18n.console.shell.loading_session} />, { locale: "ar" });
    const region = screen.getByRole("status");
    expect(region.getAttribute("aria-busy")).toBe("true");
    expect(region.getAttribute("aria-label")).toBe("جارٍ تحميل الجلسة");
  });
});
