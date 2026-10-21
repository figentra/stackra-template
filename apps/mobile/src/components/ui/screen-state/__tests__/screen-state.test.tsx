/**
 * Stackra file contract:
 * Purpose: the error state prefers the module's translated refusal over the raw message, in both
 *          locales; loading sketches the requested rows.
 * Boundary: unit tier, @stackra/testing/native providers (i18n with the generated catalogues).
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0140, ADR 0080
 */
import { fakeClientError } from "@stackra/clients/testing";
import { describe, expect, it, vi } from "@stackra/testing";
import { render, screen } from "@stackra/testing/native";
import { ScreenState } from "#src/components/ui/screen-state";
import { Commerce } from "#stackra/clients";

/** The three states. */
describe("ScreenState", () => {
  /**
   * A refusal the producing module translates shows in the user's locale, not as the raw message.
   */
  it("shows the translated refusal when the module ships one", () => {
    const error = fakeClientError({
      refusal: Commerce.refusals.insufficient_stock,
      message: "raw",
    });
    render(<ScreenState kind="error" error={error} onRetry={vi.fn()} />, { locale: "ar" });
    expect(screen.getByText("المخزون غير كافٍ.")).toBeTruthy();
    expect(screen.queryByText("raw")).toBeNull();
  });

  /** An unknown refusal falls back to the envelope's message. */
  it("falls back to the envelope message for an unknown refusal", () => {
    const error = fakeClientError({ message: "Something broke" });
    render(<ScreenState kind="error" error={error} onRetry={vi.fn()} />, { locale: "en" });
    expect(screen.getByText("Something broke")).toBeTruthy();
  });

  /** `rows` controls the skeleton count. */
  it("sketches the requested number of rows while loading", () => {
    render(<ScreenState kind="loading" rows={5} />);
    expect(screen.getByTestId("state-loading").children).toHaveLength(5);
  });
});
