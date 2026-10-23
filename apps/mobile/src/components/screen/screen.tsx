/**
 * Stackra file contract:
 * Purpose: the scroll container every screen renders into, so layout and safe-area handling live in
 *          one place.
 * Boundary: a class component for scroll layout only; no data and no navigation. Padding uses
 *           logical classes (`px-`, `ps-`), never left/right.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: class
 *                     components), ADR 0061, ADR 0080
 */
import { Component } from "@stackra/ui/native";
import { RefreshControl, ScrollView } from "react-native";
import type { ScreenProps } from "#src/components/screen/screen.props";

/**
 * The scroll container. `automatic` insets let content scroll under the glass header and the
 * minimized tab bar.
 */
export class Screen extends Component<ScreenProps> {
  /** The scroll view, with a refresh control only when `onRefresh` is given. */
  render() {
    const { children, onRefresh, isRefreshing = false, testID } = this.props;
    return (
      <ScrollView
        testID={testID}
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
        className="flex-1 bg-background"
        contentContainerClassName="gap-6 px-4 pb-16 pt-2"
        refreshControl={
          onRefresh ? <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} /> : undefined
        }
      >
        {children}
      </ScrollView>
    );
  }
}
