/**
 * Stackra file contract:
 * Purpose: converts a `loyalty_kit.points.earned.v1` payload (no tier, no balance) into the v2
 *          shape on read, so stored v1 rows and consumers pinned before the bump keep working.
 *          Publishing v1 during the sunset window is the event's own `alsoPublish`, not this class.
 * Boundary: one pure transformer per adjacent version pair, composed into a path by
 *           @stackra/versioning. The event class carries no version in its key; `@Version(2)` on it
 *           and this upcast are the whole bump.
 * Runtime: node
 * Governing contract: ADR 0118 (dated versions, transformer chain), ADR 0131 (sunset)
 */
import { EventUpcast, Upcast } from "@stackra/versioning";
import { LoyaltyTier } from "#core/enums/loyalty-tier.enum";
import { PointsEarned } from "#node/events/points-earned.event";

/** The v1 payload, kept here so the upcast is type-checked against what was actually published. */
interface PointsEarnedV1 {
  readonly memberId: string;
  readonly points: number;
  readonly reference: string;
}

/**
 * A v1 row has no balance, so `balanceAfter` is the credit itself and the tier is bronze; listeners
 * treat both as lower bounds.
 */
@Upcast(PointsEarned, { from: 1, sunset: "2027-04-01" })
export class PointsEarnedFromV1 extends EventUpcast<PointsEarnedV1, PointsEarned> {
  /** Lifts a v1 payload to v2 by filling the two fields v1 never carried. */
  upcast(v1: PointsEarnedV1): PointsEarned["data"] {
    return { ...v1, tier: LoyaltyTier.Bronze, balanceAfter: v1.points };
  }
}
