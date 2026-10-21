/**
 * Stackra file contract:
 * Purpose: the override point "how today's points movement is drawn". The kit declares the point
 *          and its props; its own ./react entry registers the default component for it, and an app
 *          may register another.
 * Boundary: a declaration, no React. Props are typed from the points-issued query's own output
 *           (`PointsIssuedView`), so the widget never hands a component data of another shape. The
 *           file is `override-points/points-issued-tile.point.ts`; its binding is an `@Override` in
 *           react/overrides.
 * Runtime: isomorphic
 * Governing contract: ADR 0234 d9 (amended: `overrides/`), ADR 0164
 */
import { OverridePoint } from "@stackra/panel";
import type { PointsIssuedView } from "#core/schemas/points-issued-view.schema";

/** What a component receives. */
export interface PointsIssuedProps {
  /** The bound query's output; undefined while loading. */
  readonly data?: PointsIssuedView;
  /** True while the panel refreshes after a `refreshOn` event. */
  readonly isRefreshing: boolean;
}

/**
 * Referenced by `PointsIssuedWidget`; registered in
 * `src/react/overrides/points-issued.override.tsx`.
 */
@OverridePoint()
export class PointsIssuedTile extends OverridePoint<PointsIssuedProps> {}
