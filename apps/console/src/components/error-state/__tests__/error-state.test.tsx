/**
 * Stackra file contract:
 * Purpose: a permission envelope renders without retry; an unknown error renders generically and is
 *          reported.
 * Boundary: unit tier, jsdom; the error reporter is the testing fake.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0140
 */
import { describe, expect, it, vi } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { AppError, ErrorCategory } from "@stackra/errors";
import { ErrorState } from "#src/components/error-state";

/** Guards the shared error view shown whenever a console query fails. */
describe(ErrorState, () => {
  /** Retrying a permission refusal can never succeed, so offering it would mislead the user. */
  it("shows no retry for a permission refusal", () => {
    const denied = new AppError({
      category: ErrorCategory.Forbidden,
      code: "order_cancel_denied",
    });
    render(<ErrorState error={denied} onRetry={vi.fn()} />, { locale: "en" });
    expect(screen.getByRole("alert")).toHaveTextContent("You do not have access");
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });

  /** Unknown errors must be reported for diagnosis while internals stay hidden from the user. */
  it("reports an unknown error and keeps details off the screen", () => {
    const { reporter } = render(
      <ErrorState error={new TypeError("x is undefined")} onRetry={vi.fn()} />,
      { locale: "en" },
    );
    expect(screen.getByRole("alert")).not.toHaveTextContent("x is undefined");
    expect(reporter.reported()).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
  });
});
