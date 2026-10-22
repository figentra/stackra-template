/**
 * Stackra file contract:
 * Purpose: the console's one loading state: a skeleton for content areas or a centred spinner for
 *          the full screen.
 * Boundary: presentation; `aria-busy` on the region and a visually hidden label, so the state is
 *           announced once and the skeleton itself is silent. Pages render it from a loader's
 *           deferred data, the shell while the session loads.
 * Runtime: browser
 * Governing contract: ADR 0128, accessibility rule of the e2e tier (axe is the block)
 */
import { Skeleton, Spinner } from "@stackra/ui";
import { useTranslation } from "@stackra/i18n/react";
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
  /** Skeleton rows to draw in-place. @defaultValue 3 */
  readonly rows?: number;
}

/** A busy region with a hidden label. */
export function LoadingState({ label, fullScreen = false, rows = 3 }: LoadingStateProps) {
  const { t } = useTranslation();
  if (fullScreen) {
    return (
      <div role="status" aria-busy="true" className="grid min-h-dvh place-items-center">
        <Spinner size="lg" aria-label={t(label)} />
      </div>
    );
  }
  return (
    <div role="status" aria-busy="true" aria-label={t(label)} className="flex flex-col gap-3">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-6 w-full rounded" />
      ))}
    </div>
  );
}
