/**
 * Stackra file contract:
 * Purpose: the console's one loading state: a skeleton for content areas or a centred spinner for
 *          the full screen.
 * Boundary: presentation; `aria-busy` on the region and a visually hidden label, so the state is
 *           announced once and the skeleton itself is silent. Pages render it from a loader's
 *           deferred data, the shell while the session loads. A class component; gen compiles it to
 *           a function component.
 * Runtime: browser
 * Governing contract: ADR 0128, accessibility rule of the e2e tier (axe is the block), ADR 0294 (as
 *                     amended by programming model v3.1, AGENTS.md: class components)
 */
import { useTranslation } from "@stackra/i18n/react";
import { Component, Skeleton, Spinner } from "@stackra/ui";
import type { LoadingStateProps } from "./loading-state.props";

/** A busy region with a hidden label. */
export class LoadingState extends Component<LoadingStateProps> {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** A spinner over the viewport, or skeleton rows in place. */
  render() {
    const { label, fullScreen = false, rows = 3 } = this.props;
    if (fullScreen) {
      return (
        <div role="status" aria-busy="true" className="grid min-h-dvh place-items-center">
          <Spinner size="lg" aria-label={this.i18n.t(label)} />
        </div>
      );
    }
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label={this.i18n.t(label)}
        className="flex flex-col gap-3"
      >
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-6 w-full rounded" />
        ))}
      </div>
    );
  }
}
