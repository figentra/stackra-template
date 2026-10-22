/**
 * Stackra file contract:
 * Purpose: the LoyaltyMembers port: who may redeem. The kit asks; the host answers from its own
 *          customer data.
 * Boundary: an abstract class that is its own token. The kit ships no driver for it: a host
 *           registers one under its own name (commerce's is `@Driver(LoyaltyMembers, "commerce")`),
 *           which is the port's only
 *           candidate (so no config field selects it), and gen fails the build when none does
 *           (unresolved port). Earning does not ask: the first earn enrolls.
 * Runtime: isomorphic
 * Governing contract: ADR 0260 decision 9 (a package needing host data defines a port), ADR 0263
 */
import type { MemberId } from "#core/types/member-id.type";

/** Answers membership questions the kit cannot answer itself. */
export abstract class LoyaltyMembers {
  /** Whether this principal may take part; a redemption by a non-member is refused. */
  abstract isMember(principalId: MemberId): Promise<boolean>;
}
