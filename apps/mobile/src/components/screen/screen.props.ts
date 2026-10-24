/**
 * Stackra file contract:
 * Purpose: the props of the scroll container every screen renders into.
 * Boundary: a type only, beside the component it types; re-exported by the folder's `index.ts`.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: Props
 *                     in their own file)
 */
import type { ReactNode } from "react";

/** Props of `Screen`. */
export interface ScreenProps {
  /** The screen's content, stacked with a 24pt gap. */
  readonly children: ReactNode;
  /** When given, pull-to-refresh calls it; `isRefreshing` shows the spinner. */
  readonly onRefresh?: () => void;
  /**
   * Whether a refresh is in flight.
   *
   * @defaultValue false
   */
  readonly isRefreshing?: boolean;
  /** Maestro and screen readers find the screen by this id. */
  readonly testID?: string;
}
