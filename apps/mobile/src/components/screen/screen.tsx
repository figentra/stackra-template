/**
 * Stackra file contract:
 * Purpose: the scroll container every screen renders into, so layout and safe-area handling live in
 *          one place.
 * Boundary: scroll layout only; no data and no navigation. Padding uses logical classes (`px-`,
 *           `ps-`), never left/right.
 * Runtime: react-native
 * Governing contract: ADR 0061, ADR 0080
 */
import type { ReactNode } from "react";
import { RefreshControl, ScrollView } from "react-native";

/** Props of {@link Screen}. */
export interface ScreenProps {
  /** The screen's content, stacked with a 24pt gap. */
  readonly children: ReactNode;
  /** When given, pull-to-refresh calls it; `isRefreshing` shows the spinner. */
  readonly onRefresh?: () => void;
  /** Whether a refresh is in flight. @defaultValue false */
  readonly isRefreshing?: boolean;
  /** Maestro and screen readers find the screen by this id. */
  readonly testID?: string;
}

/**
 * The scroll container. `automatic` insets let content scroll under the glass header and the
 * minimized tab bar.
 */
export function Screen({ children, onRefresh, isRefreshing = false, testID }: ScreenProps) {
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
