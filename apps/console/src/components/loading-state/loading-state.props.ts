/**
 * Stackra file contract:
 * Purpose: `LoadingStateProps`: how the console's one loading state is shown.
 * Boundary: a props type only, beside its component; the label is an i18n key.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: props files)
 */
import type { I18nKey } from "#stackra/i18n";

/** How the loading state is shown. */
export interface LoadingStateProps {
  /** What is loading, for the visually hidden label. */
  readonly label: I18nKey;
  /**
   * Centred spinner over the whole viewport (boot, session) instead of an in-place skeleton.
   * @defaultValue false
   */
  readonly fullScreen?: boolean;
  /**
   * Skeleton rows to draw in-place.
   *
   * @defaultValue 3
   */
  readonly rows?: number;
}
