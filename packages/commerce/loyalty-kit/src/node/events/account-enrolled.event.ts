/**
 * Stackra file contract:
 * Purpose: the fact that an account now exists for a principal. Leaves through the host's outbox as
 *          `loyalty_kit.account.enrolled.v1`.
 * Boundary: an integration event: typed fields, built only with `AccountEnrolled.create`, recorded
 *           once, by AccountService#enroll. Version 1 until a breaking change adds `version: 2` and
 *           a change file beside this one.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 5, 16 and 20), ADR 0141 (names and envelope), ADR 0078
 *                     (outbox)
 */
import type { PublicId } from "@stackra/contracts";
import { IntegrationEvent } from "@stackra/events";
import type { LoyaltyTier } from "#contracts/enums/loyalty-tier.enum";

/**
 * The account exists now; consumers react to it without asking the kit.
 *
 * @example
 * account.record(AccountEnrolled.create({ accountId, memberId, tier }));
 * async handle(event: AccountEnrolled) { event.tier } // in a listener
 */
export class AccountEnrolled extends IntegrationEvent({ name: "account.enrolled" }) {
  /** The new account. */
  accountId!: PublicId<"lac">;

  /** The principal it belongs to. */
  memberId!: string;

  /** The tier it starts at. */
  tier!: LoyaltyTier;
}
