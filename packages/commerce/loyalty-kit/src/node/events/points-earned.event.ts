/**
 * Stackra file contract:
 * Purpose: the fact that points were credited. Public; on the wire as
 *          `loyalty_kit.points.earned.v2`.
 * Boundary: version 2 adds the tier and the balance after, so consumers need no second call. The
 *           outbox publishes the current version only; `alsoPublish: [1]` keeps `.v1` on the wire
 *           until `sunset` for consumers that have not moved, and the upcast in versions/ converts
 *           stored v1 rows on read.
 * Runtime: isomorphic
 * Governing contract: ADR 0141, ADR 0131 (deprecation window)
 */
import { Event, IntegrationEvent, Version, z } from "@stackra/events";
import { LoyaltyTier } from "#core/enums/loyalty-tier.enum";

/**
 * Recorded by AccountService.earn after the ledger entry is written; the balance is read in the
 * same transaction.
 */
@Event({ name: "points.earned", public: true })
@Version(2, { alsoPublish: [1], sunset: "2027-04-01" })
export class PointsEarned extends IntegrationEvent(
  z.object({
    memberId: z.string(),
    points: z.number().int(),
    reference: z.string(),
    tier: LoyaltyTier.schema,
    balanceAfter: z.number().int(),
  }),
) {}
