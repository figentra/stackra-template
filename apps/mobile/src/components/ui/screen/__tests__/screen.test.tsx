/**
 * Stackra file contract:
 * Purpose: the container renders its children and wires pull-to-refresh only when a handler is
 *          given.
 * Boundary: unit tier, @stackra/testing/native providers; no navigation container needed.
 * Runtime: react-native
 * Governing contract: ADR 0022
 */
import { describe, expect, it, vi } from "@stackra/testing";
import { render, screen } from "@stackra/testing/native";
import { Text } from "react-native";

import { Screen } from "#src/components/ui/screen";

/** Guards the base mobile screen wrapper that every screen is built on. */
describe("Screen", () => {
  /** Content must render inside the scroll container so long screens stay reachable. */
  it("renders children inside the scroll container", () => {
    render(
      <Screen testID="s">
        <Text>hello</Text>
      </Screen>,
    );
    expect(screen.getByText("hello")).toBeTruthy();
    expect(screen.getByTestId("s")).toBeTruthy();
  });

  /** A pull-to-refresh spinner must exist only when a handler is supplied. */
  it("has no refresh control without a handler", () => {
    const onRefresh = vi.fn();
    const { rerender } = render(<Screen>{null}</Screen>);
    expect(screen.queryByRole("progressbar")).toBeNull();
    rerender(
      <Screen onRefresh={onRefresh} isRefreshing>
        {null}
      </Screen>,
    );
    expect(screen.getByRole("progressbar")).toBeTruthy();
  });
});
