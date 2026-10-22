/**
 * Stackra file contract:
 * Purpose: derives "expires soon" from a balance view; the React hook of the points-balance
 *          component.
 * Boundary: a React hook named `use*`, kept beside its component in `use-*.ts`: `hooks/` is
 *           reserved for extension hooks, so a React hook never lives there.
 * Runtime: browser
 * Governing contract: ADR 0231 (hooks start with `use`), ADR 0265 (`hooks/` is extension hooks
 *                     only)
 */
import { useState } from "react";
import type { BalanceView } from "#core/schemas/balance-view.schema";

/** Thirty days in milliseconds; the warning window. */
const SOON_MS = 30 * 24 * 60 * 60 * 1_000;

/** What the balance tile needs beyond the data itself. */
export interface PointsBalanceState {
  /** True when the oldest live points expire within thirty days of now. */
  readonly expiresSoon: boolean;
}

/**
 * Derives the expiry warning of a balance view.
 * @returns `expiresSoon` true when the oldest live points expire within thirty days of now.
 */
export function usePointsBalance(data?: BalanceView): PointsBalanceState {
  // the clock is read once, when the tile mounts: a thirty-day window needs no ticking time, and
  // render stays pure
  const [now] = useState(Date.now);
  const expiry = data?.nextExpiryAt;
  return { expiresSoon: !!expiry && Date.parse(expiry) - now < SOON_MS };
}
