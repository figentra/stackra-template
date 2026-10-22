/**
 * Stackra file contract:
 * Purpose: the fact that an account now exists for a principal. Public, so it leaves through the
 *          host's outbox as `loyalty_kit.account.enrolled.v1`.
 * Boundary: one event per class; version 1 until `@Version` says otherwise. Recorded once, by
 *           AccountService.enroll.
 * Runtime: isomorphic
 * Governing contract: ADR 0141 (names and envelope), ADR 0078 (outbox)
 */
import { Event, IntegrationEvent, z } from "@stackra/events";
import { LoyaltyTier } from "#core/enums/loyalty-tier.enum";

/**
 * The account exists now; consumers react to it without asking the kit.
 *
 * @example
 * account.record(new AccountEnrolled({ accountId, memberId, tier }));
 * @OnEvent(AccountEnrolled) async handle(event: AccountEnrolled) { event.data.tier }
 */
@Event({ name: "account.enrolled", public: true })
export class AccountEnrolled extends IntegrationEvent(
  z.object({ accountId: z.string(), memberId: z.string(), tier: LoyaltyTier.schema }),
) {}
