/**
 * Stackra file contract:
 * Purpose: proves the sessionless frame is the `main` landmark the skip link targets, with the
 *          brand mark named in the user's language.
 * Boundary: unit tier, jsdom; the frame renders inside the testing router with an empty outlet.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0241
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { PublicFrame } from "#src/components/public-frame";

/** Guards the frame around the sign-in page. */
describe(PublicFrame, () => {
  /** The logo's text is the product's name in Arabic, not the file name. */
  it("is the main landmark with the named brand mark", () => {
    render(<PublicFrame />, { locale: "ar", route: "/login" });
    expect(screen.getByRole("main").id).toBe("main");
    expect(screen.getByRole("img", { name: "وحدة تحكم Acme" })).toBeTruthy();
  });
});
