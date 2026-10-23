/**
 * Stackra file contract:
 * Purpose: `PointsIssuedProps`: what the panel hands the web renderer of PointsIssuedWidget.
 * Boundary: an interface in its own file beside the component (one declaration per file), exported
 *           from the `./react` entry so an app's shadow takes the same Props. The data is the
 *           points-issued query's own output (`PointsIssuedView`, from core).
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 2 and 15, as amended by programming model v3.1,
 *                     AGENTS.md)
 */
import type { PointsIssuedView } from "#core/schemas/points-issued-view.schema";

/** The bound query's output and the refresh state. */
export interface PointsIssuedProps {
  /** The bound query's output; undefined while loading. */
  readonly data?: PointsIssuedView;

  /** True while the panel refreshes after points are earned. */
  readonly isRefreshing: boolean;
}
