/**
 * Stackra file contract:
 * Purpose: points were debited by a redemption. Private: hosts react through the workflow's output,
 *          so it never leaves the service; the balance query's cache is dropped by it.
 * Boundary: a domain event dispatched after commit in process; never in the outbox, never
 *           versioned, never broadcast, never a webhook, so it takes no options and its base is
 *           written bare. Every event base comes from @stackra/events and the base names the
 *           delivery: DomainEvent (in process), IntegrationEvent (outbox, versioned),
 *           WebhookEvent (inbound), AnalyticsEvent (client analytics).
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 16 and 20), ADR 0141 (private events), ADR 0078
 *                     decision 3 (domain events are not versioned)
 */
import { DomainEvent } from "@stackra/events";
import { Int } from "@stackra/validation";

/** Recorded by the redeem workflow's `debit` step with `ctx.record` (no aggregate). */
export class PointsRedeemed extends DomainEvent {
  /** The member debited. */
  memberId!: string;

  /** Points debited, as a positive number. */
  @Int
  points!: number;

  /** The redemption's reference. */
  reference!: string;
}
