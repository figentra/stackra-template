/**
 * Stackra file contract:
 * Purpose: the override point "how a points balance is drawn". The kit declares the point and its
 *          props; its own ./react entry registers the default component for it, and an app may
 *          register another.
 * Boundary: a declaration, no React. Props are the balance query's output plus the panel's refresh
 *           flag; gen checks that something registers a component and types the component from this
 *           class. The file is `override-points/points-balance.point.ts`; its binding is an
 *           `@Override` in react/overrides.
 * Runtime: isomorphic
 * Governing contract: ADR 0164, guides/programming-model.mdx#override-points
 */
import { OverridePoint } from "@stackra/panel";
import type { BalanceView } from "#core/schemas/balance-view.schema";

/** What a component receives. */
export interface PointsBalanceProps {
  /** The bound query's output; undefined while loading. */
  readonly data?: BalanceView;
  /** True while the panel refreshes after a `refreshOn` event. */
  readonly isRefreshing: boolean;
}

/**
 * Referenced by the widget and the overview document; registered in
 * `src/react/overrides/points-balance.override.tsx`.
 */
@OverridePoint()
export class PointsBalanceTile extends OverridePoint<PointsBalanceProps> {}
