/**
 * Stackra file contract:
 * Purpose: the button starts the hosted flow; a cancelled flow shows the inline error and stays on
 *          the page.
 * Boundary: unit tier; the session fake's `signIn` is controlled per test.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0206
 */
import { AppError, ErrorCategory } from "@stackra/errors";
import { fakeSession } from "@stackra/identity/testing";
import { describe, expect, it } from "@stackra/testing";
import { renderRoute, screen, userEvent } from "@stackra/testing/native";
import { SessionStatus } from "@stackra/identity";
import { Routes } from "#stackra/routes";

/** The sign-in page over its route. */
describe("SignInPage", () => {
  /** One press, one `signIn`. */
  it("starts the PKCE flow", async () => {
    const session = fakeSession({ status: SessionStatus.SignedOut });
    renderRoute(Routes.sign_in, { locale: "ar", session });
    await userEvent.press(screen.getByTestId("sign-in-button"));
    expect(session.signIn).toHaveBeenCalled();
  });

  /** A cancelled browser flow is an inline error, not a crash and not a navigation. */
  it("shows an inline error when the flow is cancelled", async () => {
    const cancelled = new AppError({
      category: ErrorCategory.Unauthenticated,
      code: "sign_in_cancelled",
      retryable: true,
    });
    const session = fakeSession({
      status: SessionStatus.SignedOut,
      signIn: () => Promise.reject(cancelled),
    });
    renderRoute(Routes.sign_in, { locale: "en", session });
    await userEvent.press(screen.getByTestId("sign-in-button"));
    expect(await screen.findByText("Something went wrong")).toBeTruthy();
  });
});
