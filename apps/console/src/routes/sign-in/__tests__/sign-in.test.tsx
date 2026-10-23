/**
 * Stackra file contract:
 * Purpose: proves the sign-in hand-off names the page with its one `<h1>` and offers the BFF login
 *          as a real link, for a browser that blocked the automatic redirect.
 * Boundary: unit tier, jsdom; the page renders with SignInRoute's loader data.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0241
 */
import { describe, expect, it } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { SignIn } from "#src/routes/sign-in/sign-in";

/** Guards the only page a signed-out user sees. */
describe(SignIn, () => {
  /** The fallback is a link to the BFF, never a form that could take a password. */
  it("titles the page and links to the BFF login", () => {
    const loginUrl = "https://api.acme.example/api/auth/login?returnTo=%2F";
    render(<SignIn data={{ loginUrl }} />, { locale: "en" });
    expect(screen.getByRole("heading", { level: 1, name: "Signing you in" })).toBeTruthy();
    const link = screen.getByRole("link", { name: "Continue to sign in" });
    expect(link.getAttribute("href")).toBe(loginUrl);
    expect(screen.queryByRole("textbox")).toBeNull();
  });
});
