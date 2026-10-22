/**
 * Stackra file contract:
 * Purpose: points were debited by a redemption. Private: hosts react through the workflow's output,
 *          so it never leaves the service; the balance query's cache is invalidated by it.
 * Boundary: a `DomainEvent` dispatched after commit in process; never in the outbox, so its name
 *           carries no version (`loyalty_kit.points.redeemed`).
 * Runtime: isomorphic
 * Governing contract: ADR 0141 (private events), ADR 0078 decision 3 (domain events are not
 *                     versioned)
 */
import { DomainEvent, Event, z } from "@stackra/events";

/** Recorded by the redeem workflow's `debit` step with `ctx.record` (no aggregate). */
@Event({ name: "points.redeemed" })
export class PointsRedeemed extends DomainEvent(
  z.object({ memberId: z.string(), points: z.number().int(), reference: z.string() }),
) {}
